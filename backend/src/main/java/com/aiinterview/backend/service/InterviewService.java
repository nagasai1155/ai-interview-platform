package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.CreateSessionRequest;
import com.aiinterview.backend.dto.SubmitAnswerRequest;
import com.aiinterview.backend.entity.*;
import com.aiinterview.backend.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class InterviewService {

    private final InterviewSessionRepository sessionRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public InterviewService(InterviewSessionRepository sessionRepository,
                            QuestionRepository questionRepository,
                            AnswerRepository answerRepository,
                            ResumeRepository resumeRepository,
                            UserRepository userRepository,
                            GeminiService geminiService,
                            ObjectMapper objectMapper) {
        this.sessionRepository = sessionRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.geminiService = geminiService;
        this.objectMapper = objectMapper;
    }

    // ─── CREATE SESSION + GENERATE QUESTIONS ──────────────────
    public Map<String, Object> createSession(CreateSessionRequest req,
                                             String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                    new UsernameNotFoundException("User not found"));

        Resume resume = resumeRepository.findById(req.getResumeId())
                .orElseThrow(() ->
                    new RuntimeException("Resume not found"));

        // STEP 1: create session
        InterviewSession session = new InterviewSession();
        session.setUser(user);
        session.setResume(resume);
        session.setJobTitle(req.getJobTitle());
        session.setJobDescription(req.getJobDescription());
        session.setInterviewType(req.getInterviewType());
        session.setStatus("IN_PROGRESS");
        sessionRepository.save(session);

        // STEP 2: generate questions using Gemini
        List<Question> questions = generateQuestions(
            session, resume, req.getJobTitle(),
            req.getJobDescription(), req.getQuestionCount()
        );

        // STEP 3: build response
        List<Map<String, Object>> questionList = new ArrayList<>();
        for (Question q : questions) {
            Map<String, Object> qMap = new HashMap<>();
            qMap.put("id", q.getId());
            qMap.put("questionText", q.getQuestionText());
            qMap.put("category", q.getCategory());
            qMap.put("difficulty", q.getDifficulty());
            qMap.put("orderIndex", q.getOrderIndex());
            questionList.add(qMap);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", session.getId());
        response.put("jobTitle", session.getJobTitle());
        response.put("status", session.getStatus());
        response.put("questions", questionList);
        response.put("message", "Interview session created with "
            + questions.size() + " questions");

        return response;
    }

    // ─── SUBMIT ANSWER + GET AI FEEDBACK ──────────────────────
    public Map<String, Object> submitAnswer(Long sessionId,
                                            SubmitAnswerRequest req,
                                            String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                    new UsernameNotFoundException("User not found"));

        InterviewSession session = sessionRepository
                .findByIdAndUserId(sessionId, user.getId())
                .orElseThrow(() ->
                    new RuntimeException("Session not found"));

        Question question = questionRepository.findById(req.getQuestionId())
                .orElseThrow(() ->
                    new RuntimeException("Question not found"));

        // STEP 1: evaluate answer with Gemini
        Map<String, Object> evaluation = evaluateAnswer(
            question.getQuestionText(), req.getAnswerText()
        );

        // STEP 2: save answer to DB
        Answer answer = new Answer();
        answer.setQuestion(question);
        answer.setSession(session);
        answer.setAnswerText(req.getAnswerText());
        answer.setScore((Integer) evaluation.get("score"));
        answer.setAiFeedback((String) evaluation.get("feedback"));
        answer.setStrengths((String) evaluation.get("strengths"));
        answer.setImprovements((String) evaluation.get("improvements"));
        answerRepository.save(answer);

        // STEP 3: check if all questions answered → complete session
        List<Answer> allAnswers = answerRepository.findBySessionId(sessionId);
        List<Question> allQuestions =
            questionRepository.findBySessionIdOrderByOrderIndex(sessionId);

        if (allAnswers.size() >= allQuestions.size()) {
            // all questions answered — calculate overall score
            int totalScore = allAnswers.stream()
                    .mapToInt(Answer::getScore)
                    .sum();
            int avgScore = totalScore / allAnswers.size();

            session.setOverallScore(avgScore);
            session.setStatus("COMPLETED");
            session.setCompletedAt(LocalDateTime.now());
            sessionRepository.save(session);
        }

        // STEP 4: return feedback to frontend
        Map<String, Object> response = new HashMap<>();
        response.put("answerId", answer.getId());
        response.put("questionId", question.getId());
        response.put("score", answer.getScore());
        response.put("feedback", answer.getAiFeedback());
        response.put("strengths", answer.getStrengths());
        response.put("improvements", answer.getImprovements());
        response.put("sessionStatus", session.getStatus());

        // next question
        int nextIndex = question.getOrderIndex() + 1;
        if (nextIndex < allQuestions.size()) {
            Question nextQ = allQuestions.get(nextIndex);
            Map<String, Object> nextQuestion = new HashMap<>();
            nextQuestion.put("id", nextQ.getId());
            nextQuestion.put("questionText", nextQ.getQuestionText());
            nextQuestion.put("category", nextQ.getCategory());
            nextQuestion.put("orderIndex", nextQ.getOrderIndex());
            response.put("nextQuestion", nextQuestion);
        } else {
            response.put("nextQuestion", null);
            response.put("message", "Interview completed! Score: "
                + session.getOverallScore() + "/10");
        }

        return response;
    }

    // ─── GET SESSION WITH ALL Q&A ──────────────────────────────
    public Map<String, Object> getSession(Long sessionId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                    new UsernameNotFoundException("User not found"));

        InterviewSession session = sessionRepository
                .findByIdAndUserId(sessionId, user.getId())
                .orElseThrow(() ->
                    new RuntimeException("Session not found"));

        List<Question> questions =
            questionRepository.findBySessionIdOrderByOrderIndex(sessionId);
        List<Answer> answers = answerRepository.findBySessionId(sessionId);

        // map answers by questionId for easy lookup
        Map<Long, Answer> answerMap = new HashMap<>();
        for (Answer a : answers) {
            answerMap.put(a.getQuestion().getId(), a);
        }

        List<Map<String, Object>> qaList = new ArrayList<>();
        for (Question q : questions) {
            Map<String, Object> qa = new HashMap<>();
            qa.put("questionId", q.getId());
            qa.put("questionText", q.getQuestionText());
            qa.put("category", q.getCategory());
            qa.put("difficulty", q.getDifficulty());
            qa.put("orderIndex", q.getOrderIndex());

            Answer a = answerMap.get(q.getId());
            if (a != null) {
                qa.put("answered", true);
                qa.put("answerText", a.getAnswerText());
                qa.put("score", a.getScore());
                qa.put("feedback", a.getAiFeedback());
                qa.put("strengths", a.getStrengths());
                qa.put("improvements", a.getImprovements());
            } else {
                qa.put("answered", false);
            }

            qaList.add(qa);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", session.getId());
        response.put("jobTitle", session.getJobTitle());
        response.put("status", session.getStatus());
        response.put("overallScore", session.getOverallScore());
        response.put("startedAt", session.getStartedAt());
        response.put("completedAt", session.getCompletedAt());
        response.put("questionsAndAnswers", qaList);

        return response;
    }

    // ─── GET ALL SESSIONS FOR USER ─────────────────────────────
    public List<Map<String, Object>> getUserSessions(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                    new UsernameNotFoundException("User not found"));

        List<InterviewSession> sessions = sessionRepository
                .findByUserIdOrderByStartedAtDesc(user.getId());

        List<Map<String, Object>> result = new ArrayList<>();
        for (InterviewSession s : sessions) {
            Map<String, Object> map = new HashMap<>();
            map.put("sessionId", s.getId());
            map.put("jobTitle", s.getJobTitle());
            map.put("status", s.getStatus());
            map.put("overallScore", s.getOverallScore());
            map.put("interviewType", s.getInterviewType());
            map.put("startedAt", s.getStartedAt());
            map.put("completedAt", s.getCompletedAt());
            result.add(map);
        }
        return result;
    }

    // ─── PRIVATE: GENERATE QUESTIONS VIA GEMINI ───────────────
    private List<Question> generateQuestions(InterviewSession session,
                                             Resume resume,
                                             String jobTitle,
                                             String jobDescription,
                                             int count) {
        String prompt = """
            You are an expert technical interviewer.

            Generate exactly %d interview questions for this candidate.

            CANDIDATE SKILLS: %s
            JOB TITLE: %s
            JOB DESCRIPTION: %s

            Mix of question types:
            - technical: questions about their specific skills
            - behavioural: past experience questions (STAR format)
            - situational: hypothetical scenario questions

            Return ONLY a JSON array with no extra text or markdown:
            [
              {
                "questionText": "Explain how JWT authentication works",
                "category": "technical",
                "difficulty": "MEDIUM"
              }
            ]
            """.formatted(
                count,
                resume.getParsedSkills() != null
                    ? resume.getParsedSkills() : resume.getRawText(),
                jobTitle,
                jobDescription != null ? jobDescription : jobTitle
            );

        String response = geminiService.generate(prompt);
        String cleaned = cleanJson(response);

        List<Question> savedQuestions = new ArrayList<>();

        try {
            JsonNode array = objectMapper.readTree(cleaned);
            int index = 0;
            for (JsonNode node : array) {
                Question q = new Question();
                q.setSession(session);
                q.setQuestionText(node.path("questionText").asText());
                q.setCategory(node.path("category").asText("technical"));
                q.setDifficulty(node.path("difficulty").asText("MEDIUM"));
                q.setOrderIndex(index++);
                savedQuestions.add(questionRepository.save(q));
            }
        } catch (Exception e) {
            System.out.println("Question parse error: " + e.getMessage());
            // fallback — save raw as one question
            Question q = new Question();
            q.setSession(session);
            q.setQuestionText("Tell me about your experience with "
                + jobTitle);
            q.setCategory("general");
            q.setDifficulty("MEDIUM");
            q.setOrderIndex(0);
            savedQuestions.add(questionRepository.save(q));
        }

        return savedQuestions;
    }

    // ─── PRIVATE: EVALUATE ANSWER VIA GEMINI ──────────────────
    private Map<String, Object> evaluateAnswer(String questionText,
                                               String answerText) {
        String prompt = """
            You are an expert interviewer evaluating a candidate's answer.

            QUESTION: %s
            CANDIDATE'S ANSWER: %s

            Evaluate the answer and return ONLY a JSON object with no extra text:
            {
              "score": 7,
              "feedback": "Good answer overall. You explained the concept clearly.",
              "strengths": "Clear explanation, good use of examples",
              "improvements": "Could mention security implications, add more depth"
            }

            Score out of 10. Be specific and constructive.
            """.formatted(questionText, answerText);

        String response = geminiService.generate(prompt);
        String cleaned = cleanJson(response);

        Map<String, Object> result = new HashMap<>();
        result.put("score", 5);
        result.put("feedback", "Answer received.");
        result.put("strengths", "");
        result.put("improvements", "");

        try {
            JsonNode node = objectMapper.readTree(cleaned);
            result.put("score", node.path("score").asInt(5));
            result.put("feedback", node.path("feedback").asText(""));
            result.put("strengths", node.path("strengths").asText(""));
            result.put("improvements", node.path("improvements").asText(""));
        } catch (Exception e) {
            System.out.println("Evaluation parse error: " + e.getMessage());
        }

        return result;
    }

    private String cleanJson(String response) {
        if (response == null) return "[]";
        return response
                .replace("```json", "")
                .replace("```JSON", "")
                .replace("```", "")
                .trim();
    }
}
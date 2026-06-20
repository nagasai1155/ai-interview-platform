package com.aiinterview.backend.controller;

import com.aiinterview.backend.entity.Answer;
import com.aiinterview.backend.entity.InterviewSession;
import com.aiinterview.backend.entity.Resume;
import com.aiinterview.backend.repository.AnswerRepository;
import com.aiinterview.backend.repository.InterviewSessionRepository;
import com.aiinterview.backend.repository.ResumeRepository;
import com.aiinterview.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final InterviewSessionRepository sessionRepository;
    private final AnswerRepository answerRepository;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    public AnalyticsController(InterviewSessionRepository sessionRepository,
                               AnswerRepository answerRepository,
                               ResumeRepository resumeRepository,
                               UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.answerRepository = answerRepository;
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(
            Authentication authentication) {
        try {
            String email = authentication.getName();
            Long userId = userRepository.findByEmail(email)
                    .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"))
                    .getId();

            // get all sessions
            List<InterviewSession> sessions = sessionRepository
                    .findByUserIdOrderByStartedAtDesc(userId);

            // get all answers for all sessions
            List<Answer> allAnswers = new ArrayList<>();
            for (InterviewSession s : sessions) {
                allAnswers.addAll(answerRepository.findBySessionId(s.getId()));
            }

            // get all resumes
            List<Resume> resumes = resumeRepository.findByUserId(userId);

            // calculate stats
            int totalSessions = sessions.size();
            int completedSessions = (int) sessions.stream()
                    .filter(s -> "COMPLETED".equals(s.getStatus()))
                    .count();
            int totalAnswers = allAnswers.size();

            double avgScore = allAnswers.stream()
                    .mapToInt(Answer::getScore)
                    .average()
                    .orElse(0.0);

            int bestScore = allAnswers.stream()
                    .mapToInt(Answer::getScore)
                    .max()
                    .orElse(0);

            // score trend — last 7 sessions
            List<Map<String, Object>> scoreTrend = new ArrayList<>();
            List<InterviewSession> recentSessions = sessions.stream()
                    .filter(s -> "COMPLETED".equals(s.getStatus()))
                    .limit(7)
                    .toList();

            // reverse so oldest first
            List<InterviewSession> orderedSessions =
                new ArrayList<>(recentSessions);
            Collections.reverse(orderedSessions);

            for (int i = 0; i < orderedSessions.size(); i++) {
                InterviewSession s = orderedSessions.get(i);
                Map<String, Object> point = new HashMap<>();
                point.put("session", "S" + (i + 1));
                point.put("score", s.getOverallScore());
                point.put("jobTitle", s.getJobTitle());
                point.put("date", s.getStartedAt());
                scoreTrend.add(point);
            }

            // category breakdown
            Map<String, List<Integer>> categoryScores = new HashMap<>();
            for (InterviewSession s : sessions) {
                List<Answer> sessionAnswers =
                    answerRepository.findBySessionId(s.getId());
                // we don't have category on answer directly
                // so use overall session score per type
            }

            // recent sessions list
            List<Map<String, Object>> recentList = new ArrayList<>();
            for (InterviewSession s : sessions.stream().limit(5).toList()) {
                Map<String, Object> map = new HashMap<>();
                map.put("sessionId", s.getId());
                map.put("jobTitle", s.getJobTitle());
                map.put("status", s.getStatus());
                map.put("overallScore", s.getOverallScore());
                map.put("startedAt", s.getStartedAt());
                map.put("completedAt", s.getCompletedAt());
                recentList.add(map);
            }

            // build response
            Map<String, Object> response = new HashMap<>();
            response.put("totalSessions", totalSessions);
            response.put("completedSessions", completedSessions);
            response.put("totalAnswers", totalAnswers);
            response.put("averageScore", Math.round(avgScore * 10.0) / 10.0);
            response.put("bestScore", bestScore);
            response.put("totalResumes", resumes.size());
            response.put("scoreTrend", scoreTrend);
            response.put("recentSessions", recentList);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
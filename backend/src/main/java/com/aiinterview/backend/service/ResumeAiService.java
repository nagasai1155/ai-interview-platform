package com.aiinterview.backend.service;

import com.aiinterview.backend.entity.Resume;
import com.aiinterview.backend.repository.ResumeRepository;
import com.aiinterview.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class ResumeAiService {

    private final GeminiService geminiService;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public ResumeAiService(GeminiService geminiService,
                           ResumeRepository resumeRepository,
                           UserRepository userRepository,
                           ObjectMapper objectMapper) {
        this.geminiService = geminiService;
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    // ─── PARSE RESUME WITH GEMINI ─────────────────────────────
    public Resume parseResume(Long resumeId, String email) {

        userRepository.findByEmail(email)
                .orElseThrow(() ->
                    new UsernameNotFoundException("User not found"));

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() ->
                    new RuntimeException("Resume not found with id: " + resumeId));

        String rawText = resume.getRawText();

        if (rawText == null || rawText.isBlank()) {
            throw new RuntimeException("Resume has no extracted text. " +
                "Please re-upload the resume.");
        }

        System.out.println("Calling Gemini to extract skills...");
        String skills = extractSkills(rawText);
        resume.setParsedSkills(skills);
        System.out.println("Skills extracted: " + skills);

        System.out.println("Calling Gemini to extract experience...");
        String experience = extractExperience(rawText);
        resume.setParsedExperience(experience);
        System.out.println("Experience extracted: " + experience);

        System.out.println("Calling Gemini to generate summary...");
        String summary = generateSummary(rawText);
        resume.setParsedSummary(summary);
        System.out.println("Summary generated: " + summary);

        resumeRepository.save(resume);
        System.out.println("Resume saved to DB successfully");

        return resume;
    }

    // ─── ATS SCORE CHECKER ────────────────────────────────────
    public int checkAtsScore(Long resumeId, String jobDescription,
                             String email) {

        userRepository.findByEmail(email)
                .orElseThrow(() ->
                    new UsernameNotFoundException("User not found"));

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() ->
                    new RuntimeException("Resume not found"));

        String prompt = """
            You are an ATS (Applicant Tracking System) expert.

            Compare this resume against the job description and give an ATS score.

            RESUME:
            %s

            JOB DESCRIPTION:
            %s

            Return ONLY a JSON object in this exact format with no extra text:
            {
              "score": 75,
              "matchedKeywords": ["Java", "Spring Boot", "REST API"],
              "missingKeywords": ["Docker", "Kubernetes"],
              "suggestions": ["Add Docker experience", "Mention CI/CD pipelines"]
            }
            """.formatted(resume.getRawText(), jobDescription);

        String response = geminiService.generate(prompt);
        String cleaned = cleanJson(response);

        System.out.println("ATS response from Gemini: " + cleaned);

        try {
            var node = objectMapper.readTree(cleaned);
            int score = node.path("score").asInt();
            resume.setAtsScore(score);
            resumeRepository.save(resume);
            return score;
        } catch (Exception e) {
            System.out.println("ATS score parse failed: " + e.getMessage());
            return 0;
        }
    }

    // ─── PRIVATE HELPERS ──────────────────────────────────────

    private String extractSkills(String rawText) {
        String prompt = """
            Extract all technical and soft skills from this resume.

            RESUME TEXT:
            %s

            Return ONLY a JSON array of strings with no extra text or markdown:
            ["Java", "Spring Boot", "React", "MySQL", "Problem Solving"]
            """.formatted(rawText);

        String response = geminiService.generate(prompt);
        return cleanJson(response);
    }

    private String extractExperience(String rawText) {
        String prompt = """
            Extract work experience from this resume.

            RESUME TEXT:
            %s

            Return ONLY a JSON array with no extra text or markdown:
            [
              {
                "title": "Full Stack Developer Intern",
                "company": "Sendora.ai",
                "duration": "October 2025 - December 2025",
                "highlights": ["Built REST APIs", "Implemented JWT auth"]
              }
            ]
            """.formatted(rawText);

        String response = geminiService.generate(prompt);
        return cleanJson(response);
    }

    private String generateSummary(String rawText) {
        String prompt = """
            Write a 2-3 sentence professional summary for this candidate
            based on their resume. Be specific about their skills and experience.

            RESUME TEXT:
            %s

            Return ONLY the summary paragraph, no extra text.
            """.formatted(rawText);

        return geminiService.generate(prompt);
    }

 private String cleanJson(String response) {
    if (response == null) return "[]";
    
    String cleaned = response
            .replace("```json", "")
            .replace("```JSON", "")
            .replace("```", "")
            .replaceAll("[\u0000-\u001F]", " ")
            .trim();

    // if JSON array is truncated — close it properly
    if (cleaned.startsWith("[") && !cleaned.endsWith("]")) {
        // find last complete object ending with }
        int lastBrace = cleaned.lastIndexOf("}");
        if (lastBrace != -1) {
            cleaned = cleaned.substring(0, lastBrace + 1) + "]";
        } else {
            return "[]";
        }
    }

    // if JSON object is truncated — close it properly
    if (cleaned.startsWith("{") && !cleaned.endsWith("}")) {
        int lastBrace = cleaned.lastIndexOf(",");
        if (lastBrace != -1) {
            cleaned = cleaned.substring(0, lastBrace) + "}";
        } else {
            return "{}";
        }
    }

    return cleaned;
}
}
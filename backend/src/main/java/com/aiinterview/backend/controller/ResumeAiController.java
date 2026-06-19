package com.aiinterview.backend.controller;

import com.aiinterview.backend.entity.Resume;
import com.aiinterview.backend.service.ResumeAiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes/ai")
public class ResumeAiController {

    private final ResumeAiService resumeAiService;
    private final WebClient webClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    public ResumeAiController(ResumeAiService resumeAiService,
                              WebClient.Builder webClientBuilder) {
        this.resumeAiService = resumeAiService;
        this.webClient = webClientBuilder.build();
    }

    // TEMPORARY — finds available Gemini models for your API key
    @GetMapping("/models")
    public ResponseEntity<?> getModels() {
        try {
            String response = webClient.get()
                    .uri("https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/parse/{resumeId}")
    public ResponseEntity<Map<String, Object>> parseResume(
            @PathVariable Long resumeId,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            Resume resume = resumeAiService.parseResume(resumeId, email);

            Map<String, Object> response = new HashMap<>();
            response.put("resumeId", resume.getId());
            response.put("parsedSkills",
                resume.getParsedSkills() != null ? resume.getParsedSkills() : "[]");
            response.put("parsedExperience",
                resume.getParsedExperience() != null ? resume.getParsedExperience() : "[]");
            response.put("parsedSummary",
                resume.getParsedSummary() != null ? resume.getParsedSummary() : "");
            response.put("message", "Resume parsed successfully by AI");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("PARSE ERROR: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/ats/{resumeId}")
    public ResponseEntity<Map<String, Object>> checkAts(
            @PathVariable Long resumeId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            String jobDescription = body.get("jobDescription");

            if (jobDescription == null || jobDescription.isBlank()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Job description is required");
                return ResponseEntity.badRequest().body(error);
            }

            int score = resumeAiService.checkAtsScore(
                resumeId, jobDescription, email);

            Map<String, Object> response = new HashMap<>();
            response.put("resumeId", resumeId);
            response.put("atsScore", score);
            response.put("message", "ATS score calculated");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("ATS ERROR: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
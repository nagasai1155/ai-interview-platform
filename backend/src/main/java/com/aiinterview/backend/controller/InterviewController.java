package com.aiinterview.backend.controller;

import com.aiinterview.backend.dto.CreateSessionRequest;
import com.aiinterview.backend.dto.SubmitAnswerRequest;
import com.aiinterview.backend.service.InterviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interview")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    // POST /api/interview/session
    // creates session + generates questions
    @PostMapping("/session")
    public ResponseEntity<Map<String, Object>> createSession(
            @RequestBody CreateSessionRequest req,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            Map<String, Object> response =
                interviewService.createSession(req, email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    // POST /api/interview/session/{sessionId}/answer
    // submits answer + gets AI feedback
    @PostMapping("/session/{sessionId}/answer")
    public ResponseEntity<Map<String, Object>> submitAnswer(
            @PathVariable Long sessionId,
            @RequestBody SubmitAnswerRequest req,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            Map<String, Object> response =
                interviewService.submitAnswer(sessionId, req, email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    // GET /api/interview/session/{sessionId}
    // get full session with all Q&A
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<Map<String, Object>> getSession(
            @PathVariable Long sessionId,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            Map<String, Object> response =
                interviewService.getSession(sessionId, email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    // GET /api/interview/sessions
    // get all sessions for logged in user
    @GetMapping("/sessions")
    public ResponseEntity<List<Map<String, Object>>> getUserSessions(
            Authentication authentication) {
        try {
            String email = authentication.getName();
            List<Map<String, Object>> sessions =
                interviewService.getUserSessions(email);
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
}
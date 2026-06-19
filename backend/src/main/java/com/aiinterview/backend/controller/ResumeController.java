package com.aiinterview.backend.controller;

import com.aiinterview.backend.dto.ResumeResponse;
import com.aiinterview.backend.service.ResumeService;

import org.apache.tika.exception.TikaException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.xml.sax.SAXException;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    // POST /api/resumes/upload
    // accepts multipart form data (file upload)
    @PostMapping("/upload")
    public ResponseEntity<ResumeResponse> uploadResume(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException, TikaException, SAXException  {

        String email = authentication.getName();
        // authentication is auto filled by JwtAuthFilter
        // .getName() returns the logged in user's email

        ResumeResponse response = resumeService.uploadResume(file, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // GET /api/resumes
    // get all resumes for logged in user
    @GetMapping
    public ResponseEntity<List<ResumeResponse>> getUserResumes(
            Authentication authentication) {

        String email = authentication.getName();
        List<ResumeResponse> resumes = resumeService.getUserResumes(email);
        return ResponseEntity.ok(resumes);
    }

    // GET /api/resumes/{id}
    // get one specific resume
    @GetMapping("/{id}")
    public ResponseEntity<ResumeResponse> getResume(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();
        ResumeResponse resume = resumeService.getResume(id, email);
        return ResponseEntity.ok(resume);
    }

    // DELETE /api/resumes/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResume(
            @PathVariable Long id,
            Authentication authentication) throws IOException {

        String email = authentication.getName();
        resumeService.deleteResume(id, email);
        return ResponseEntity.noContent().build();  // 204
    }
}
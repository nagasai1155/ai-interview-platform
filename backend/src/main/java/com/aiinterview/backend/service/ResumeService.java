package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.ResumeResponse;
import com.aiinterview.backend.entity.Resume;
import com.aiinterview.backend.entity.User;
import com.aiinterview.backend.repository.ResumeRepository;
import com.aiinterview.backend.repository.UserRepository;
import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.xml.sax.SAXException;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;  // "uploads/resumes"

    // Apache Tika — the text extractor
    private final Tika tika = new Tika();

    public ResumeService(ResumeRepository resumeRepository,
                         UserRepository userRepository) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
    }

    // ─── UPLOAD RESUME ────────────────────────────────────────
    public ResumeResponse uploadResume(MultipartFile file, String email)
            throws IOException, TikaException, SAXException  {

        // STEP 1: find the logged in user from DB
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                    new UsernameNotFoundException("User not found"));

        // STEP 2: validate file type
        String contentType = file.getContentType();
        if (contentType == null ||
            (!contentType.equals("application/pdf") &&
             !contentType.equals("application/vnd.openxmlformats-officedocument" +
                                 ".wordprocessingml.document"))) {
            throw new RuntimeException("Only PDF and DOCX files are allowed");
        }

        // STEP 3: create unique file name so files don't overwrite each other
        String originalName = file.getOriginalFilename();
        // originalName = "john_resume.pdf"

        String uniqueFileName = UUID.randomUUID() + "_" + originalName;
        // uniqueFileName = "550e8400-e29b-41d4_john_resume.pdf"

        // STEP 4: create folder if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            // creates "uploads/resumes" folder on your computer
        }

        // STEP 5: save file to disk
        Path filePath = uploadPath.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), filePath,
                   StandardCopyOption.REPLACE_EXISTING);
        // file is now saved at: uploads/resumes/550e8400..._john_resume.pdf

        // STEP 6: extract text from PDF/DOCX using Apache Tika
        String extractedText = tika.parseToString(filePath.toFile());
        // Tika reads the file and gives you all the text as a plain string
        // Example result:
        // "John Doe john@gmail.com
        //  Skills: Java, Spring Boot, React
        //  Experience: Software Engineer at TCS 2021-2023..."

        // STEP 7: save resume info to MySQL
        Resume resume = new Resume();
        resume.setUser(user);
        resume.setFileName(originalName);           // "john_resume.pdf"
        resume.setFileUrl(filePath.toString());     // "uploads/resumes/uuid_..."
        resume.setFileType(contentType);            // "application/pdf"
        resume.setRawText(extractedText);           // full text from PDF

        resumeRepository.save(resume);
        // INSERT INTO resumes (user_id, file_name, file_url, raw_text...)

        // STEP 8: return response to frontend
        return mapToResponse(resume, "Resume uploaded and parsed successfully");
    }

    // ─── GET ALL RESUMES FOR USER ─────────────────────────────
    public List<ResumeResponse> getUserResumes(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                    new UsernameNotFoundException("User not found"));

        return resumeRepository.findByUserId(user.getId())
                .stream()
                .map(r -> mapToResponse(r, null))
                .collect(Collectors.toList());
        // gets all resumes for this user and converts to response objects
    }

    // ─── GET ONE RESUME ───────────────────────────────────────
    public ResumeResponse getResume(Long resumeId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                    new UsernameNotFoundException("User not found"));

        Resume resume = resumeRepository
                .findByIdAndUserId(resumeId, user.getId())
                .orElseThrow(() ->
                    new RuntimeException("Resume not found"));
        // findByIdAndUserId ensures user can only see THEIR resume
        // user A cannot access user B's resume even if they know the ID

        return mapToResponse(resume, null);
    }

    // ─── DELETE RESUME ────────────────────────────────────────
    public void deleteResume(Long resumeId, String email) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                    new UsernameNotFoundException("User not found"));

        Resume resume = resumeRepository
                .findByIdAndUserId(resumeId, user.getId())
                .orElseThrow(() ->
                    new RuntimeException("Resume not found"));

        // delete file from disk
        Path filePath = Paths.get(resume.getFileUrl());
        Files.deleteIfExists(filePath);

        // delete from MySQL
        resumeRepository.delete(resume);
    }

    // ─── HELPER ──────────────────────────────────────────────
    private ResumeResponse mapToResponse(Resume resume, String message) {
        return new ResumeResponse(
                resume.getId(),
                resume.getFileName(),
                resume.getFileUrl(),
                resume.getFileType(),
                resume.getRawText(),
                resume.getAtsScore(),
                resume.getUploadedAt(),
                message
        );
    }
}
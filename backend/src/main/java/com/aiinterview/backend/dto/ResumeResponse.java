package com.aiinterview.backend.dto;

import java.time.LocalDateTime;

public class ResumeResponse {

    private Long id;
    private String fileName;
    private String fileUrl;
    private String fileType;
    private String rawText;
    private Integer atsScore;
    private LocalDateTime uploadedAt;
    private String message;

    // Constructor for upload response
    public ResumeResponse(Long id, String fileName, String fileUrl,
                          String fileType, String rawText,
                          Integer atsScore, LocalDateTime uploadedAt,
                          String message) {
        this.id = id;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.fileType = fileType;
        this.rawText = rawText;
        this.atsScore = atsScore;
        this.uploadedAt = uploadedAt;
        this.message = message;
    }

    // Getters
    public Long getId() { return id; }
    public String getFileName() { return fileName; }
    public String getFileUrl() { return fileUrl; }
    public String getFileType() { return fileType; }
    public String getRawText() { return rawText; }
    public Integer getAtsScore() { return atsScore; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public String getMessage() { return message; }
}
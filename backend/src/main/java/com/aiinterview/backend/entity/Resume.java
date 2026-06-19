package com.aiinterview.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resumes")
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String fileName;
    private String fileUrl;
    private String fileType;

    @Column(columnDefinition = "TEXT")
    private String rawText;

  @Column(columnDefinition = "TEXT")
private String parsedSkills;

@Column(columnDefinition = "TEXT")
private String parsedExperience;

@Column(columnDefinition = "TEXT")
private String parsedSummary;

    private Integer atsScore = 0;

    private LocalDateTime uploadedAt;

    @PrePersist
    public void prePersist() {
        uploadedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public String getRawText() { return rawText; }
    public void setRawText(String rawText) { this.rawText = rawText; }

    public String getParsedSkills() { return parsedSkills; }
    public void setParsedSkills(String parsedSkills) { this.parsedSkills = parsedSkills; }

    public String getParsedExperience() { return parsedExperience; }
    public void setParsedExperience(String parsedExperience) { this.parsedExperience = parsedExperience; }

    public String getParsedSummary() { return parsedSummary; }
    public void setParsedSummary(String parsedSummary) { this.parsedSummary = parsedSummary; }

    public Integer getAtsScore() { return atsScore; }
    public void setAtsScore(Integer atsScore) { this.atsScore = atsScore; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
}
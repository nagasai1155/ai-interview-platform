package com.aiinterview.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "interview_sessions")
public class InterviewSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id")
    private Resume resume;

    private String jobTitle;

    @Column(columnDefinition = "TEXT")
    private String jobDescription;

    // IN_PROGRESS | COMPLETED | ABANDONED
    private String status = "IN_PROGRESS";

    private Integer overallScore = 0;

    // TEXT | VOICE | CODING
    private String interviewType = "TEXT";

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL)
    private List<Question> questions;

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    @PrePersist
    public void prePersist() {
        startedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Resume getResume() { return resume; }
    public void setResume(Resume resume) { this.resume = resume; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getOverallScore() { return overallScore; }
    public void setOverallScore(Integer overallScore) { this.overallScore = overallScore; }

    public String getInterviewType() { return interviewType; }
    public void setInterviewType(String interviewType) { this.interviewType = interviewType; }

    public List<Question> getQuestions() { return questions; }

    public LocalDateTime getStartedAt() { return startedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
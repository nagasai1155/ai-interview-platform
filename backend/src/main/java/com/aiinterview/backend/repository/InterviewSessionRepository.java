package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewSessionRepository
        extends JpaRepository<InterviewSession, Long> {

    List<InterviewSession> findByUserIdOrderByStartedAtDesc(Long userId);

    Optional<InterviewSession> findByIdAndUserId(Long id, Long userId);
}
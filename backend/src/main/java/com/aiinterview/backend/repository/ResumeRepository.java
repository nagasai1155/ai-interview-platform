package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {

    // get all resumes for a specific user
    List<Resume> findByUserId(Long userId);

    // get one resume by id and user id
    // prevents user A from accessing user B's resume
    Optional<Resume> findByIdAndUserId(Long id, Long userId);
}
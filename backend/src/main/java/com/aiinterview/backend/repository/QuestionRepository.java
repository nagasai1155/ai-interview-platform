package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findBySessionIdOrderByOrderIndex(Long sessionId);
}
package com.AI_BASED.BACKEND.REPOSITORY;

import com.AI_BASED.BACKEND.ENTITY.DifficultyLevel;
import com.AI_BASED.BACKEND.ENTITY.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository
        extends JpaRepository<Question, Long> {

    List<Question> findBySubject(String subject);

    List<Question> findByExam_ExamId(Long examId);

    List<Question> findByDifficultyLevel(
            DifficultyLevel difficultyLevel);
}

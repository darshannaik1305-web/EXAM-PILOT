package com.AI_BASED.BACKEND.REPOSITORY;

import com.AI_BASED.BACKEND.ENTITY.PracticeQuestion;
import com.AI_BASED.BACKEND.ENTITY.PracticeSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PracticeQuestionRepository extends JpaRepository<PracticeQuestion, Long> {

    List<PracticeQuestion> findByPracticeSession(PracticeSession practiceSession);

    void deleteByPracticeSession(PracticeSession practiceSession);
}


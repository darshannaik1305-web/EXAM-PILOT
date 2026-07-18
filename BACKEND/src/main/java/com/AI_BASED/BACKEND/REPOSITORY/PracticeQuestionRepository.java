package com.AI_BASED.BACKEND.REPOSITORY;

import com.AI_BASED.BACKEND.ENTITY.PracticeQuestion;
import com.AI_BASED.BACKEND.ENTITY.PracticeSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface PracticeQuestionRepository extends JpaRepository<PracticeQuestion, Long> {

    List<PracticeQuestion> findByPracticeSession(PracticeSession practiceSession);

    Optional<PracticeQuestion> findByPracticeSessionAndQuestionNumber(PracticeSession practiceSession, int questionNumber);

    @Modifying
    @Transactional
    @Query("DELETE FROM PracticeQuestion q WHERE q.practiceSession = :session")
    void deleteByPracticeSession(@Param("session") PracticeSession session);
}


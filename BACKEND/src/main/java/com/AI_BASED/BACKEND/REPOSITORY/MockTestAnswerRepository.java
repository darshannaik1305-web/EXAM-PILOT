package com.AI_BASED.BACKEND.REPOSITORY;

import com.AI_BASED.BACKEND.ENTITY.MockTestAnswer;
import com.AI_BASED.BACKEND.ENTITY.MockTestSession;
import com.AI_BASED.BACKEND.ENTITY.PracticeQuestion;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface MockTestAnswerRepository extends JpaRepository<MockTestAnswer, Long> {

    @EntityGraph(attributePaths = {"practiceQuestion"})
    List<MockTestAnswer> findByMockTestSession(MockTestSession mockTestSession);

    Optional<MockTestAnswer> findByMockTestSessionAndPracticeQuestion(MockTestSession mockTestSession, PracticeQuestion practiceQuestion);

    @Modifying
    @Transactional
    @Query("DELETE FROM MockTestAnswer a WHERE a.mockTestSession = :session")
    void deleteByMockTestSession(@Param("session") MockTestSession session);

    @Modifying
    @Transactional
    @Query("DELETE FROM MockTestAnswer a WHERE a.mockTestSession IN :sessions")
    void deleteByMockTestSessionIn(@Param("sessions") List<MockTestSession> sessions);
}

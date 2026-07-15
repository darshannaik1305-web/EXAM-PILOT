package com.AI_BASED.BACKEND.REPOSITORY;

import com.AI_BASED.BACKEND.ENTITY.MockTestAnswer;
import com.AI_BASED.BACKEND.ENTITY.MockTestSession;
import com.AI_BASED.BACKEND.ENTITY.PracticeQuestion;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MockTestAnswerRepository extends JpaRepository<MockTestAnswer, Long> {

    @EntityGraph(attributePaths = {"practiceQuestion"})
    List<MockTestAnswer> findByMockTestSession(MockTestSession mockTestSession);

    Optional<MockTestAnswer> findByMockTestSessionAndPracticeQuestion(MockTestSession mockTestSession, PracticeQuestion practiceQuestion);
}

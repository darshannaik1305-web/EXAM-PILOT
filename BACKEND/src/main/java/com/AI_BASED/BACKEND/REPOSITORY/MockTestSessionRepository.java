package com.AI_BASED.BACKEND.REPOSITORY;

import com.AI_BASED.BACKEND.ENTITY.MockTestSession;
import com.AI_BASED.BACKEND.ENTITY.MockTestStatus;
import com.AI_BASED.BACKEND.ENTITY.PracticeSession;
import com.AI_BASED.BACKEND.ENTITY.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MockTestSessionRepository extends JpaRepository<MockTestSession, Long> {

    Optional<MockTestSession> findFirstByUserAndPracticeSessionAndStatus(User user, PracticeSession practiceSession, MockTestStatus status);

    List<MockTestSession> findByUserOrderByStartedAtDesc(User user);
    
    Optional<MockTestSession> findFirstByUserAndStatus(User user, MockTestStatus status);

    List<MockTestSession> findByUserAndPracticeSessionInOrderByStartedAtDesc(User user, List<PracticeSession> sessions);

    List<MockTestSession> findByPracticeSessionAndUserOrderByStartedAtDesc(PracticeSession session, User user);

    long countByUserAndPracticeSession(User user, PracticeSession session);
}

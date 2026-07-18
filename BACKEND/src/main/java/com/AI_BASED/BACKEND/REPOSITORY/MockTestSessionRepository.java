package com.AI_BASED.BACKEND.REPOSITORY;

import com.AI_BASED.BACKEND.ENTITY.MockTestSession;
import com.AI_BASED.BACKEND.ENTITY.MockTestStatus;
import com.AI_BASED.BACKEND.ENTITY.PracticeSession;
import com.AI_BASED.BACKEND.ENTITY.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

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

    long countByUser(User user);

    @Query("SELECT COALESCE(SUM(s.totalQuestions), 0) FROM MockTestSession s WHERE s.user = :user AND s.status = com.AI_BASED.BACKEND.ENTITY.MockTestStatus.COMPLETED")
    long sumQuestionsSolvedByUser(@Param("user") User user);

    @Modifying
    @Transactional
    @Query("DELETE FROM MockTestSession s WHERE s IN :sessions")
    void deleteAllInBatch_(@Param("sessions") List<MockTestSession> sessions);
}

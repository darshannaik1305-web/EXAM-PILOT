package com.AI_BASED.BACKEND.REPOSITORY;

import com.AI_BASED.BACKEND.ENTITY.MockTestResult;
import com.AI_BASED.BACKEND.ENTITY.MockTestSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface MockTestResultRepository extends JpaRepository<MockTestResult, Long> {

    Optional<MockTestResult> findByMockTestSession(MockTestSession mockTestSession);

    List<MockTestResult> findByMockTestSessionIn(List<MockTestSession> sessions);

    @Modifying
    @Transactional
    @Query("DELETE FROM MockTestResult r WHERE r.mockTestSession = :session")
    void deleteByMockTestSession(@Param("session") MockTestSession session);
}

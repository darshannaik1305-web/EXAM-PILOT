package com.AI_BASED.BACKEND.REPOSITORY;

import com.AI_BASED.BACKEND.ENTITY.MockTestDifficultyResult;
import com.AI_BASED.BACKEND.ENTITY.MockTestSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface MockTestDifficultyResultRepository extends JpaRepository<MockTestDifficultyResult, Long> {

    List<MockTestDifficultyResult> findByMockTestSession(MockTestSession mockTestSession);

    List<MockTestDifficultyResult> findByMockTestSessionIn(List<MockTestSession> sessions);

    @Modifying
    @Transactional
    @Query("DELETE FROM MockTestDifficultyResult r WHERE r.mockTestSession IN :sessions")
    void deleteByMockTestSessionIn(@Param("sessions") List<MockTestSession> sessions);
}

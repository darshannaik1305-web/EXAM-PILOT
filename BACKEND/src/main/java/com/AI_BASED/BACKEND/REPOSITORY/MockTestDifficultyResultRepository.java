package com.AI_BASED.BACKEND.REPOSITORY;

import com.AI_BASED.BACKEND.ENTITY.MockTestDifficultyResult;
import com.AI_BASED.BACKEND.ENTITY.MockTestSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MockTestDifficultyResultRepository extends JpaRepository<MockTestDifficultyResult, Long> {

    List<MockTestDifficultyResult> findByMockTestSession(MockTestSession mockTestSession);
}

package com.AI_BASED.BACKEND.REPOSITORY;

import com.AI_BASED.BACKEND.ENTITY.MockTestResult;
import com.AI_BASED.BACKEND.ENTITY.MockTestSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MockTestResultRepository extends JpaRepository<MockTestResult, Long> {

    Optional<MockTestResult> findByMockTestSession(MockTestSession mockTestSession);
}

package com.AI_BASED.BACKEND.REPOSITORY;

import com.AI_BASED.BACKEND.ENTITY.TestResult;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestResultRepository
        extends JpaRepository<TestResult, Long> {
}


package com.AI_BASED.BACKEND.REPOSITORY;

import com.AI_BASED.BACKEND.ENTITY.TestSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestSessionRepository
        extends JpaRepository<TestSession, Long> {
}


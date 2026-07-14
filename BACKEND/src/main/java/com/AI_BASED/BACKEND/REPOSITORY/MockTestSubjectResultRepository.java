package com.AI_BASED.BACKEND.REPOSITORY;

import com.AI_BASED.BACKEND.ENTITY.MockTestSession;
import com.AI_BASED.BACKEND.ENTITY.MockTestSubjectResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MockTestSubjectResultRepository extends JpaRepository<MockTestSubjectResult, Long> {

    List<MockTestSubjectResult> findByMockTestSession(MockTestSession mockTestSession);
}

package com.AI_BASED.BACKEND.REPOSITORY;

import com.AI_BASED.BACKEND.ENTITY.MockTestSession;
import com.AI_BASED.BACKEND.ENTITY.MockTestSubjectResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface MockTestSubjectResultRepository extends JpaRepository<MockTestSubjectResult, Long> {

    List<MockTestSubjectResult> findByMockTestSession(MockTestSession mockTestSession);

    List<MockTestSubjectResult> findByMockTestSessionIn(List<MockTestSession> sessions);

    @Modifying
    @Transactional
    @Query("DELETE FROM MockTestSubjectResult r WHERE r.mockTestSession IN :sessions")
    void deleteByMockTestSessionIn(@Param("sessions") List<MockTestSession> sessions);
}

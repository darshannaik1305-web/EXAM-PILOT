package com.AI_BASED.BACKEND.REPOSITORY;

import com.AI_BASED.BACKEND.ENTITY.PracticeSession;
import com.AI_BASED.BACKEND.ENTITY.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PracticeSessionRepository extends JpaRepository<PracticeSession, Long> {

    List<PracticeSession> findByUser(User user);

    Page<PracticeSession> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    long countByUserAndStatus(User user, com.AI_BASED.BACKEND.ENTITY.PracticeSessionStatus status);
}

package com.AI_BASED.BACKEND.SERVICE;

import com.AI_BASED.BACKEND.ENTITY.TestSession;
import com.AI_BASED.BACKEND.REPOSITORY.TestSessionRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TestSessionService {

    @Autowired
    private TestSessionRepository repo;

    public TestSession save(TestSession session) {
        return repo.save(session);
    }
}

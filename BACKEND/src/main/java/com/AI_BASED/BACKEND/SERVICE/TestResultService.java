package com.AI_BASED.BACKEND.SERVICE;

import com.AI_BASED.BACKEND.ENTITY.TestResult;
import com.AI_BASED.BACKEND.REPOSITORY.TestResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TestResultService {

    @Autowired
    private TestResultRepository repo;

    public TestResult save(TestResult result) {
        return repo.save(result);
    }
}


package com.AI_BASED.BACKEND.SERVICE;

import com.AI_BASED.BACKEND.ENTITY.Result;
import com.AI_BASED.BACKEND.ENTITY.User;
import com.AI_BASED.BACKEND.REPOSITORY.ResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResultService {

    @Autowired
    private ResultRepository resultRepository;

    public Result save(Result result) {
        return resultRepository.save(result);
    }

    public List<Result> getAllResults() {
        return resultRepository.findAll();
    }

    public Result getResult(Long id) {
        return resultRepository.findById(id).orElse(null);
    }

    // Get Results of Logged-in User
    public List<Result> getMyResults() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User user = (User) authentication.getPrincipal();

        return resultRepository.findByUser(user);
    }
}

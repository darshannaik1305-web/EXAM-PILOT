package com.AI_BASED.BACKEND.CONTROLLER;

import com.AI_BASED.BACKEND.ENTITY.Result;
import com.AI_BASED.BACKEND.SERVICE.ResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/result")
@CrossOrigin("*")
public class ResultController {

    @Autowired
    private ResultService resultService;

    // Get All Results
    @GetMapping("/all")
    public List<Result> getAllResults() {
        return resultService.getAllResults();
    }

    // Get Result By ID
    @GetMapping("/{id}")
    public Result getResult(@PathVariable Long id) {
        return resultService.getResult(id);
    }

    // Get Logged-in User Results
    @GetMapping("/my-results")
    public List<Result> getMyResults() {
        return resultService.getMyResults();
    }
}

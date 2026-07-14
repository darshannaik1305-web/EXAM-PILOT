package com.AI_BASED.BACKEND.CONTROLLER;

import com.AI_BASED.BACKEND.DTO.*;
import com.AI_BASED.BACKEND.ENTITY.User;
import com.AI_BASED.BACKEND.SERVICE.MockTestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/practice")
@CrossOrigin(origins = "http://localhost:5173")
public class MockTestController {

    @Autowired
    private MockTestService mockTestService;

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        return null;
    }

    @PostMapping("/{sessionId}/test/start")
    public ResponseEntity<MockTestSessionResponse> startOrResumeTest(@PathVariable("sessionId") Long sessionId) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        MockTestSessionResponse response = mockTestService.startOrResumeTestSession(sessionId, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test-sessions/{testSessionId}")
    public ResponseEntity<MockTestSessionResponse> getTestSession(@PathVariable("testSessionId") Long testSessionId) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        MockTestSessionResponse response = mockTestService.getTestSession(testSessionId, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test-sessions/{testSessionId}/questions/{num}")
    public ResponseEntity<MockTestQuestionResponse> getQuestion(
            @PathVariable("testSessionId") Long testSessionId,
            @PathVariable("num") int questionNumber
    ) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        MockTestQuestionResponse response = mockTestService.getQuestion(testSessionId, questionNumber, user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/test-sessions/{testSessionId}/answers/{num}")
    public ResponseEntity<MockTestQuestionResponse> saveAnswer(
            @PathVariable("testSessionId") Long testSessionId,
            @PathVariable("num") int questionNumber,
            @RequestBody MockTestAnswerRequest request
    ) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        MockTestQuestionResponse response = mockTestService.saveAnswer(testSessionId, questionNumber, request, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test-sessions/{testSessionId}/palette")
    public ResponseEntity<List<MockTestPaletteItem>> getPalette(@PathVariable("testSessionId") Long testSessionId) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<MockTestPaletteItem> response = mockTestService.getPalette(testSessionId, user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/test-sessions/{testSessionId}/submit")
    public ResponseEntity<MockTestSessionResponse> submitTest(@PathVariable("testSessionId") Long testSessionId) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        MockTestSessionResponse response = mockTestService.submitTest(testSessionId, user);
        return ResponseEntity.ok(response);
    }
}

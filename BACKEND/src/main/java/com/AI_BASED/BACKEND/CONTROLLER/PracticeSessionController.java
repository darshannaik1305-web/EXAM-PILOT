package com.AI_BASED.BACKEND.CONTROLLER;

import com.AI_BASED.BACKEND.DTO.PracticeSessionCreatedResponse;
import com.AI_BASED.BACKEND.DTO.PracticeSessionResponse;
import com.AI_BASED.BACKEND.DTO.PracticeQuestionResponse;
import com.AI_BASED.BACKEND.DTO.ExtractionSummaryResponse;
import com.AI_BASED.BACKEND.ENTITY.UploadType;
import com.AI_BASED.BACKEND.ENTITY.User;
import com.AI_BASED.BACKEND.SERVICE.PracticeSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/practice")
public class PracticeSessionController {

    @Autowired
    private PracticeSessionService practiceSessionService;

    @PostMapping("/sessions")
    public ResponseEntity<PracticeSessionCreatedResponse> createPracticeSession(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("uploadType") UploadType uploadType
    ) {
        PracticeSessionCreatedResponse response = practiceSessionService.createAndProcessSession(title, uploadType, file);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sessions")
    public ResponseEntity<Page<PracticeSessionResponse>> getSessions(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).build();
        }
        User user = (User) authentication.getPrincipal();
        Page<PracticeSessionResponse> response = practiceSessionService.getSessionsByUser(user, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sessions/{id}")
    public ResponseEntity<PracticeSessionResponse> getSessionById(@PathVariable("id") Long id) {
        PracticeSessionResponse response = practiceSessionService.getSessionById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sessions/{id}/questions")
    public ResponseEntity<List<PracticeQuestionResponse>> getQuestionsBySessionId(@PathVariable("id") Long id) {
        List<PracticeQuestionResponse> response = practiceSessionService.getQuestionsBySessionId(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sessions/{id}/summary")
    public ResponseEntity<ExtractionSummaryResponse> getExtractionSummary(@PathVariable("id") Long id) {
        ExtractionSummaryResponse response = practiceSessionService.getExtractionSummary(id);
        return ResponseEntity.ok(response);
    }
}


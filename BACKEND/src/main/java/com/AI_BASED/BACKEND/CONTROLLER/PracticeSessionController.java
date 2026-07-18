package com.AI_BASED.BACKEND.CONTROLLER;

import com.AI_BASED.BACKEND.DTO.PracticeSessionCreatedResponse;
import com.AI_BASED.BACKEND.DTO.PracticeSessionResponse;
import com.AI_BASED.BACKEND.DTO.PracticeQuestionResponse;
import com.AI_BASED.BACKEND.DTO.ExtractionSummaryResponse;
import com.AI_BASED.BACKEND.ENTITY.UploadType;
import com.AI_BASED.BACKEND.ENTITY.User;
import com.AI_BASED.BACKEND.SERVICE.PracticeSessionService;
import com.AI_BASED.BACKEND.UTIL.AuthUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/practice")
public class PracticeSessionController {

    @Autowired
    private PracticeSessionService practiceSessionService;

    @Autowired
    private AuthUtils authUtils;

    @PostMapping("/sessions")
    public ResponseEntity<PracticeSessionCreatedResponse> createPracticeSession(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("uploadType") UploadType uploadType,
            @RequestParam(value = "examDurationSeconds", required = false) Integer examDurationSeconds,
            @RequestParam(value = "positiveMarks", required = false) Double positiveMarks,
            @RequestParam(value = "negativeMarks", required = false) Double negativeMarks,
            @RequestParam(value = "examName", required = false) String examName,
            @RequestParam(value = "examStructure", required = false) String examStructure,
            @RequestParam(value = "subject", required = false) String subject
    ) {
        User user = authUtils.getCurrentUser();

        if (file == null || file.isEmpty() || file.getOriginalFilename() == null || !file.getOriginalFilename().toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are accepted.");
        }

        PracticeSessionCreatedResponse response = practiceSessionService.createAndProcessSession(
            title, uploadType, file, user,
            examDurationSeconds, positiveMarks, negativeMarks, examName, examStructure, subject
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/sessions")
    public ResponseEntity<Page<PracticeSessionResponse>> getSessions(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        User user = authUtils.getCurrentUser();
        Page<PracticeSessionResponse> response = practiceSessionService.getSessionsByUser(user, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sessions/{id}")
    public ResponseEntity<PracticeSessionResponse> getSessionById(@PathVariable("id") Long id) {
        // Ownership check is done inside the service layer
        PracticeSessionResponse response = practiceSessionService.getSessionById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sessions/{id}/questions")
    public ResponseEntity<List<PracticeQuestionResponse>> getQuestionsBySessionId(@PathVariable("id") Long id) {
        // Ownership check is done inside the service layer
        List<PracticeQuestionResponse> response = practiceSessionService.getQuestionsBySessionId(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sessions/{id}/summary")
    public ResponseEntity<ExtractionSummaryResponse> getExtractionSummary(@PathVariable("id") Long id) {
        // Ownership check is done inside the service layer
        ExtractionSummaryResponse response = practiceSessionService.getExtractionSummary(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sessions/{id}/answer-key")
    public ResponseEntity<Void> mergeAnswerKey(
            @PathVariable("id") Long id,
            @RequestParam("file") MultipartFile file
    ) {
        User user = authUtils.getCurrentUser();
        practiceSessionService.mergeAnswerKey(id, file, user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable("id") Long id) {
        User user = authUtils.getCurrentUser();
        practiceSessionService.deleteSession(id, user);
        return ResponseEntity.noContent().build();
    }
}

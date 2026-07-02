package com.AI_BASED.BACKEND.CONTROLLER;

import com.AI_BASED.BACKEND.DTO.ExtractionResponseDto;
import com.AI_BASED.BACKEND.ENTITY.UploadType;
import com.AI_BASED.BACKEND.SERVICE.PracticeSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/practice")
public class PracticeSessionController {

    @Autowired
    private PracticeSessionService practiceSessionService;

    @PostMapping("/sessions")
    public ResponseEntity<ExtractionResponseDto> createPracticeSession(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("uploadType") UploadType uploadType
    ) {
        ExtractionResponseDto response = practiceSessionService.createAndProcessSession(title, uploadType, file);
        return ResponseEntity.ok(response);
    }
}

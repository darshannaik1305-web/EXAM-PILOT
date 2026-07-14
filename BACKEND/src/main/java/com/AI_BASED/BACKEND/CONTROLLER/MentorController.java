package com.AI_BASED.BACKEND.CONTROLLER;

import com.AI_BASED.BACKEND.DTO.MentorChatRequestDto;
import com.AI_BASED.BACKEND.DTO.MentorChatResponseDto;
import com.AI_BASED.BACKEND.ENTITY.User;
import com.AI_BASED.BACKEND.SERVICE.MentorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mentor")
@CrossOrigin(origins = "http://localhost:5173")
public class MentorController {

    @Autowired
    private MentorService mentorService;

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        return null;
    }

    @PostMapping("/chat")
    public ResponseEntity<MentorChatResponseDto> chatWithMentor(@RequestBody List<MentorChatRequestDto.ChatMessageDto> messages) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        MentorChatResponseDto response = mentorService.chatWithMentor(messages, user);
        return ResponseEntity.ok(response);
    }
}

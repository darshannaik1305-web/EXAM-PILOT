package com.AI_BASED.BACKEND.CONTROLLER;

import com.AI_BASED.BACKEND.DTO.AnalyticsResponse;
import com.AI_BASED.BACKEND.ENTITY.User;
import com.AI_BASED.BACKEND.SERVICE.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:5173")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<AnalyticsResponse> getStudentAnalytics() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        AnalyticsResponse response = analyticsService.getStudentAnalytics(user);
        return ResponseEntity.ok(response);
    }
}

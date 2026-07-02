package com.AI_BASED.BACKEND.CONTROLLER;

import com.AI_BASED.BACKEND.DTO.AuthResponse;
import com.AI_BASED.BACKEND.DTO.LoginRequest;
import com.AI_BASED.BACKEND.DTO.RegisterRequest;
import com.AI_BASED.BACKEND.SERVICE.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }
}

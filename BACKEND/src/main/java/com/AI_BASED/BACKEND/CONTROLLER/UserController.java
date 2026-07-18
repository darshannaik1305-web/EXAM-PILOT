package com.AI_BASED.BACKEND.CONTROLLER;

import com.AI_BASED.BACKEND.DTO.*;
import com.AI_BASED.BACKEND.ENTITY.User;
import com.AI_BASED.BACKEND.SERVICE.UserService;
import com.AI_BASED.BACKEND.INTEGRATION.FastApiClient;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final FastApiClient fastApiClient;

    public UserController(UserService userService, FastApiClient fastApiClient) {
        this.userService = userService;
        this.fastApiClient = fastApiClient;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserSettingsDto> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getUserSettings(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<String> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UserSettingsDto dto
    ) {
        userService.updateUserSettings(user, dto);
        return ResponseEntity.ok("Profile and preferences updated successfully.");
    }

    @GetMapping("/profile/stats")
    public ResponseEntity<UserStatsDto> getStats(@AuthenticationPrincipal User user) {
        String aiVersion = fastApiClient.getAiServiceVersion();
        return ResponseEntity.ok(userService.getUserStats(user, aiVersion));
    }

    @PutMapping("/password")
    public ResponseEntity<String> changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordRequestDto dto
    ) {
        userService.changePassword(user, dto);
        return ResponseEntity.ok("Password changed successfully.");
    }

    @PostMapping("/me/delete")
    public ResponseEntity<String> deleteAccount(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody DeleteAccountRequestDto dto
    ) {
        userService.deleteUserAccount(user, dto.getPassword());
        return ResponseEntity.ok("Account and all associated resources deleted successfully.");
    }
}

package com.AI_BASED.BACKEND.SERVICE;

import com.AI_BASED.BACKEND.DTO.AuthResponse;
import com.AI_BASED.BACKEND.DTO.LoginRequest;
import com.AI_BASED.BACKEND.DTO.RegisterRequest;
import com.AI_BASED.BACKEND.ENTITY.Role;
import com.AI_BASED.BACKEND.ENTITY.User;
import com.AI_BASED.BACKEND.JWT.JwtService;
import com.AI_BASED.BACKEND.REPOSITORY.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.AI_BASED.BACKEND.REPOSITORY.UserPreferenceRepository;
import com.AI_BASED.BACKEND.REPOSITORY.PracticeSessionRepository;
import com.AI_BASED.BACKEND.REPOSITORY.MockTestSessionRepository;
import com.AI_BASED.BACKEND.ENTITY.UserPreference;
import com.AI_BASED.BACKEND.ENTITY.PracticeSession;
import java.util.List;
import com.AI_BASED.BACKEND.DTO.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${app.version:V3.5.0-BE}")
    private String backendVersion;

    @Autowired
    private UserPreferenceRepository userPreferenceRepository;

    @Autowired
    private PracticeSessionRepository practiceSessionRepository;

    @Autowired
    private MockTestSessionRepository mockTestSessionRepository;

    @Autowired
    private PracticeSessionService practiceSessionService;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // Register Student
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        // Check email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse(
                    null,
                    "Email already exists"
            );
        }

        // Check username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            return new AuthResponse(
                    null,
                    "Username already exists"
            );
        }

        // Create User
        User user = new User();

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());

        // Encode Password
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Default Role
        user.setRole(Role.STUDENT);

        user = userRepository.save(user);

        // Initialize user preferences profile during registration (zero database GET side-effects)
        UserPreference preference = new UserPreference();
        preference.setUser(user);
        preference.setTargetExam("General");
        preference.setDefaultSubject("General");
        preference.setStudyGoalHours(10);
        userPreferenceRepository.save(preference);

        return new AuthResponse(
                null,
                "Registration Successful"
        );
    }

    // Login Student
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null) {
            return new AuthResponse(
                    null,
                    "Invalid Credentials"
            );
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            return new AuthResponse(
                    null,
                    "Invalid Credentials"
            );
        }

        // Generate JWT
        String token = jwtService.generateToken(user);

        return new AuthResponse(
                token,
                "Login Successful"
        );
    }

    public UserSettingsDto getUserSettings(User user) {
        UserPreference pref = userPreferenceRepository.findByUser(user)
                .orElseThrow(() -> new com.AI_BASED.BACKEND.EXCEPTION.ResourceNotFoundException("User preferences not found"));
        UserSettingsDto dto = new UserSettingsDto();
        dto.setUsername(user.getDisplayName());
        dto.setEmail(user.getEmail());
        dto.setTargetExam(pref.getTargetExam());
        dto.setDefaultSubject(pref.getDefaultSubject());
        dto.setStudyGoalHours(pref.getStudyGoalHours());
        return dto;
    }

    @Transactional
    public void updateUserSettings(User user, UserSettingsDto dto) {
        // Core account updates
        user.setUsername(dto.getUsername());
        userRepository.save(user);

        // Preference updates
        UserPreference pref = userPreferenceRepository.findByUser(user)
                .orElseThrow(() -> new com.AI_BASED.BACKEND.EXCEPTION.ResourceNotFoundException("User preferences not found"));
        pref.setTargetExam(dto.getTargetExam());
        pref.setDefaultSubject(dto.getDefaultSubject());
        pref.setStudyGoalHours(dto.getStudyGoalHours());

        try {
            userPreferenceRepository.save(pref);
        } catch (org.springframework.orm.ObjectOptimisticLockingFailureException e) {
            throw new IllegalStateException("Settings were updated in another window. Please refresh and try again.", e);
        }
    }

    @Transactional
    public void changePassword(User user, ChangePasswordRequestDto dto) {
        // 1. Verify current password
        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Incorrect current password.");
        }

        // 2. Prevent reuse of current password
        if (dto.getNewPassword().equals(dto.getCurrentPassword())) {
            throw new IllegalArgumentException("New password cannot be identical to the current password.");
        }

        // 3. Verify confirmation
        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new IllegalArgumentException("New password confirmation does not match.");
        }

        // 4. Complexity pattern check (at least one letter and one digit)
        if (!dto.getNewPassword().matches("^(?=.*[A-Za-z])(?=.*\\d).+$")) {
            throw new IllegalArgumentException("New password must contain at least one letter and one number.");
        }

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
    }

    public UserStatsDto getUserStats(User user, String clientAiServiceVersion) {
        UserStatsDto dto = new UserStatsDto();
        dto.setMemberSince(user.getCreatedAt());
        dto.setRole(user.getRole().name());
        dto.setFrontendVersion("V3.5.0-FE");
        dto.setBackendVersion(backendVersion);
        dto.setAiServiceVersion(clientAiServiceVersion != null ? clientAiServiceVersion : "Unknown");

        // Optimized repository counts
        dto.setTotalPracticePapers(practiceSessionRepository.countByUser(user));
        dto.setTotalMockTests(mockTestSessionRepository.countByUser(user));
        dto.setTotalQuestionsSolved(mockTestSessionRepository.sumQuestionsSolvedByUser(user));

        return dto;
    }

    @Transactional
    public void deleteUserAccount(User user, String password) {
        // Idempotency check: verify user still exists in database
        if (user == null || !userRepository.existsById(user.getId())) {
            return;
        }

        // 1. Verify password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Incorrect password verification. Account deletion aborted.");
        }

        // 2. Fetch and delete all practice sessions belonging to this user
        List<PracticeSession> sessions = practiceSessionRepository.findByUser(user);
        for (PracticeSession session : sessions) {
            try {
                practiceSessionService.deleteSession(session.getId(), user);
            } catch (Exception e) {
                // Gracefully log FastApi/cleanup errors so SQL cascade can complete successfully
                System.err.println("[AccountDelete] Swallowed clean up exception for session: " 
                        + session.getId() + ", error: " + e.getMessage());
            }
        }

        // 3. Delete the user record itself (cascades to UserPreference)
        userRepository.delete(user);
    }
}

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

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // Register Student
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

        userRepository.save(user);

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
}

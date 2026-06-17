package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.*;
import com.aiinterview.backend.entity.User;
import com.aiinterview.backend.repository.UserRepository;
import com.aiinterview.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setProvider("local");
        user.setRole("USER");

        userRepository.save(user);
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        return buildAuthResponse(user);
    }

    public AuthResponse refresh(RefreshRequest req) {
        String token = req.getRefreshToken();

        if (!"refresh".equals(jwtService.extractTokenType(token))) {
            throw new RuntimeException("Invalid refresh token");
        }

        String email = jwtService.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!jwtService.isTokenValid(token, email)) {
            throw new RuntimeException("Refresh token expired, please login again");
        }

        return new AuthResponse(
                jwtService.generateAccessToken(user),
                token,   // reuse same refresh token
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }

    private AuthResponse buildAuthResponse(User user) {
        return new AuthResponse(
                jwtService.generateAccessToken(user),
                jwtService.generateRefreshToken(user),
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
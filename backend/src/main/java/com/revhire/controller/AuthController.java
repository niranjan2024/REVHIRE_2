package com.revhire.controller;

import com.revhire.dto.*;
import com.revhire.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest req) {
        authService.register(req);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PutMapping("/change-password")
    public String changePassword(@RequestBody ChangePasswordRequest req) {
        authService.changePassword(req.username, req.oldPassword, req.newPassword);
        return "Password changed successfully";
    }

    @GetMapping("/auth/profile-completion/{userId}")
    public ResponseEntity<Map<String, Integer>> profileCompletion(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of("completionPercent", authService.getProfileCompletion(userId)));
    }
}

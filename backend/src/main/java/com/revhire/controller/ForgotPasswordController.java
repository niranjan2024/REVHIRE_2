package com.revhire.controller;

import com.revhire.dto.ForgotPasswordRequest;
import com.revhire.dto.ResetPasswordRequest;
import com.revhire.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
public class ForgotPasswordController {

    private final AuthService authService;

    public ForgotPasswordController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestBody ForgotPasswordRequest req) {
        return authService.getSecurityQuestion(req.username);
    }

    @PostMapping("/reset-password")
    public String resetPassword(@RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req.username, req.answer, req.newPassword);
        return "Password reset successful";
    }
}

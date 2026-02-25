package com.revhire.controller;

import com.revhire.dto.ApiResponse;
import com.revhire.dto.AuthResponse;
import com.revhire.dto.ChangePasswordRequest;
import com.revhire.dto.ForgotPasswordRequest;
import com.revhire.dto.ForgotPasswordResponse;
import com.revhire.dto.LoginRequest;
import com.revhire.dto.ProfileCompletionRequest;
import com.revhire.dto.RegisterRequest;
import com.revhire.dto.ResetPasswordRequest;
import com.revhire.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ApiResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request,
                              HttpServletRequest httpServletRequest,
                              HttpServletResponse httpServletResponse) {
        return authService.login(request, httpServletRequest, httpServletResponse);
    }

    @PostMapping("/logout")
    public ApiResponse logout(HttpServletRequest request, HttpServletResponse response) {
        return authService.logout(request, response);
    }

    @PostMapping("/change-password")
    public ApiResponse changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                      Authentication authentication) {
        return authService.changePassword(authentication.getName(), request);
    }

    @PostMapping("/forgot-password")
    public ForgotPasswordResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return authService.forgotPassword(request);
    }

    @PostMapping("/reset-password")
    public ApiResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return authService.resetPassword(request);
    }

    @PostMapping("/auth/profile-completion/{userId}")
    public ApiResponse updateProfileCompletion(@PathVariable Long userId,
                                               @Valid @RequestBody ProfileCompletionRequest request,
                                               Authentication authentication) {
        return authService.updateProfileCompletion(userId, authentication.getName(), request);
    }
}

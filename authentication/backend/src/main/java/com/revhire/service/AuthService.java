package com.revhire.service;

import com.revhire.config.CustomUserDetailsService;
import com.revhire.dto.ApiResponse;
import com.revhire.dto.AuthResponse;
import com.revhire.dto.ChangePasswordRequest;
import com.revhire.dto.ForgotPasswordRequest;
import com.revhire.dto.ForgotPasswordResponse;
import com.revhire.dto.LoginRequest;
import com.revhire.dto.ProfileCompletionRequest;
import com.revhire.dto.RegisterRequest;
import com.revhire.dto.ResetPasswordRequest;
import com.revhire.entity.EmploymentStatus;
import com.revhire.entity.PasswordResetToken;
import com.revhire.entity.Role;
import com.revhire.entity.User;
import com.revhire.repository.PasswordResetTokenRepository;
import com.revhire.repository.UserRepository;
import com.revhire.util.LegacyPasswordUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final CustomUserDetailsService userDetailsService;
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    public AuthService(UserRepository userRepository,
                       PasswordResetTokenRepository tokenRepository,
                       PasswordEncoder passwordEncoder,
                       CustomUserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.userDetailsService = userDetailsService;
    }

    public ApiResponse register(RegisterRequest request) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase();
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password and confirm password do not match");
        }

        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() == null ? Role.JOB_SEEKER : request.getRole());
        user.setFullName(request.getFullName().trim());
        user.setMobileNumber(request.getMobileNumber().trim());
        user.setSecurityQuestion(request.getSecurityQuestion().trim());
        user.setSecurityAnswer(passwordEncoder.encode(request.getSecurityAnswer().trim()));
        user.setLocation(request.getLocation().trim());
        user.setEmploymentStatus(request.getEmploymentStatus() == null ? EmploymentStatus.FRESHER : request.getEmploymentStatus());
        userRepository.save(user);

        return new ApiResponse("Registration successful");
    }

    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        String identifier = request.getUsernameOrEmail().trim();
        User user = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(identifier, identifier)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!isPasswordValidAndUpgradeIfLegacy(user, request.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        HttpSession oldSession = httpRequest.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }
        httpRequest.getSession(true);

        UserDetails principal = userDetailsService.loadUserByUsername(user.getUsername());
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities());

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, httpRequest, httpResponse);

        return new AuthResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }

    public ApiResponse logout(HttpServletRequest request, HttpServletResponse response) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        response.setHeader("Clear-Site-Data", "\"cookies\"");
        return new ApiResponse("Logout successful");
    }

    public ApiResponse changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        boolean oldMatches = passwordEncoder.matches(request.getOldPassword(), user.getPassword())
                || LegacyPasswordUtil.sha256Hex(request.getOldPassword()).equalsIgnoreCase(user.getPassword());
        if (!oldMatches) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return new ApiResponse("Password changed successfully");
    }

    @Transactional
    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email not found"));

        tokenRepository.deleteByUser(user);
        PasswordResetToken token = new PasswordResetToken();
        token.setToken(UUID.randomUUID().toString());
        token.setUser(user);
        token.setExpiryAt(LocalDateTime.now().plusMinutes(30));
        tokenRepository.save(token);

        return new ForgotPasswordResponse("Reset token generated", token.getToken());
    }

    @Transactional
    public ApiResponse resetPassword(ResetPasswordRequest request) {
        PasswordResetToken token = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid token"));

        if (token.getExpiryAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token expired");
        }

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        tokenRepository.delete(token);
        return new ApiResponse("Password reset successful");
    }

    public ApiResponse updateProfileCompletion(Long userId, String currentUsername, ProfileCompletionRequest request) {
        User actor = userRepository.findByUsernameIgnoreCase(currentUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Current user not found"));

        if (!actor.getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own profile status");
        }

        actor.setProfileCompleted(Boolean.TRUE.equals(request.getProfileCompleted()));
        userRepository.save(actor);
        return new ApiResponse("Profile completion updated");
    }

    private boolean isPasswordValidAndUpgradeIfLegacy(User user, String rawPassword) {
        if (passwordEncoder.matches(rawPassword, user.getPassword())) {
            return true;
        }

        String legacySha = LegacyPasswordUtil.sha256Hex(rawPassword);
        if (legacySha.equalsIgnoreCase(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
            return true;
        }
        return false;
    }
}

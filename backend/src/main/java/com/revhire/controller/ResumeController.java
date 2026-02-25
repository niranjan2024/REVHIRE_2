package com.revhire.controller;

import com.revhire.dto.ResumeRequest;
import com.revhire.exception.BusinessException;
import com.revhire.security.AuthenticatedUser;
import com.revhire.service.ResumeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/resume")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    //  CREATE / UPDATE RESUME
    @PostMapping
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<String> saveResume(@RequestBody ResumeRequest request, Authentication authentication) {
        validateCurrentUser(authentication, request.userId);
        resumeService.saveResume(request);
        return ResponseEntity.ok("Resume saved successfully");
    }

    //  GET RESUME BY USER
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<?> getResume(@PathVariable Long userId, Authentication authentication) {
        validateCurrentUser(authentication, userId);
        return ResponseEntity.ok(resumeService.getResumeByUser(userId));
    }

    @GetMapping("/employer/user/{userId}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<?> getResumeForEmployer(@PathVariable Long userId) {
        return ResponseEntity.ok(resumeService.getResumeByUser(userId));
    }

    private void validateCurrentUser(Authentication authentication, Long userId) {
        Object principal = authentication != null ? authentication.getPrincipal() : null;
        if (!(principal instanceof AuthenticatedUser authenticatedUser) || !authenticatedUser.getUserId().equals(userId)) {
            throw new BusinessException("Unauthorized operation for current user");
        }
    }
}

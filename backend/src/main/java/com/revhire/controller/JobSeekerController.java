package com.revhire.controller;

import com.revhire.dto.JobSeekerProfileRequest;
import com.revhire.dto.JobSeekerProfileUpdateRequest;
import com.revhire.entity.Job;
import com.revhire.exception.BusinessException;
import com.revhire.security.AuthenticatedUser;
import com.revhire.service.JobService;
import com.revhire.service.JobSeekerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jobseeker")
@PreAuthorize("hasRole('JOB_SEEKER')")
public class JobSeekerController {

    private final JobSeekerService jobSeekerService;
    private final JobService jobService;

    public JobSeekerController(JobSeekerService jobSeekerService,
                               JobService jobService) {
        this.jobSeekerService = jobSeekerService;
        this.jobService = jobService;
    }

    //  COMPLETE PROFILE
    @PostMapping("/profile")
    public ResponseEntity<String> completeProfile(
            @RequestBody JobSeekerProfileRequest request,
            Authentication authentication) {
        validateCurrentUser(authentication, request.userId);

        jobSeekerService.completeProfile(request);
        return ResponseEntity.ok("Profile completed successfully");
    }

    //  UPDATE PROFILE
    @PutMapping("/profile")
    public ResponseEntity<String> updateProfile(
            @RequestBody JobSeekerProfileUpdateRequest request,
            Authentication authentication) {
        validateCurrentUser(authentication, request.getUserId());

        jobSeekerService.updateProfile(request);
        return ResponseEntity.ok("Profile updated successfully");
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<JobSeekerProfileRequest> getProfile(
            @PathVariable Long userId,
            Authentication authentication) {
        validateCurrentUser(authentication, userId);
        return ResponseEntity.ok(jobSeekerService.getProfile(userId));
    }

    @GetMapping("/jobs/search")
    public ResponseEntity<List<Job>> searchJobs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer experienceYears,
            @RequestParam(required = false) String companyName,
            @RequestParam(required = false) Double minSalary,
            @RequestParam(required = false) Double maxSalary,
            @RequestParam(required = false) String jobType) {

        return ResponseEntity.ok(jobService.searchJobs(
                title,          
                location,
                experienceYears,
                companyName,
                minSalary,
                maxSalary,
                jobType));
    }

    private void validateCurrentUser(Authentication authentication, Long userId) {
        Object principal = authentication != null ? authentication.getPrincipal() : null;
        if (!(principal instanceof AuthenticatedUser authenticatedUser) || !authenticatedUser.getUserId().equals(userId)) {
            throw new BusinessException("Unauthorized operation for current user");
        }
    }
}

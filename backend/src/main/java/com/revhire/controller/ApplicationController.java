package com.revhire.controller;

import com.revhire.dto.ApplyJobRequest;
import com.revhire.dto.RejectApplicationRequest;
import com.revhire.dto.WithdrawApplicationRequest;
import com.revhire.entity.Application;
import com.revhire.entity.Job;
import com.revhire.entity.User;
import com.revhire.security.AuthenticatedUser;
import com.revhire.exception.BusinessException;
import com.revhire.repository.JobRepository;
import com.revhire.repository.UserRepository;
import com.revhire.service.ApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/applications")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final JobRepository jobRepo;
    private final UserRepository userRepo;

    public ApplicationController(
            ApplicationService applicationService,
            JobRepository jobRepo,
            UserRepository userRepo) {
        this.applicationService = applicationService;
        this.jobRepo = jobRepo;
        this.userRepo = userRepo;
    }


    // APPLY JOB

    @PostMapping("/apply")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<Application> applyJob(
            @RequestBody ApplyJobRequest request,
            Authentication authentication) {
        validateCurrentUser(authentication, request.getUserId());

        Job job = jobRepo.findById(request.getJobId())
                .orElseThrow(() -> new BusinessException("Job not found"));

        User user = userRepo.findById(request.getUserId())
                .orElseThrow(() -> new BusinessException("User not found"));

        return ResponseEntity.ok(applicationService.apply(job, user, request.getCoverLetter()));
    }


    // VIEW APPLICATIONS BY JOB

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<List<Application>> getApplicationsByJob(
            @PathVariable Long jobId) {

        return ResponseEntity.ok(
                applicationService.getApplicationsByJob(jobId)
        );
    }

    @GetMapping("/job/{jobId}/search")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<List<Application>> searchApplicants(
            @PathVariable Long jobId,
            @RequestParam(required = false) Integer minExperience,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String education,
            @RequestParam(required = false) String appliedAfter) {

        LocalDateTime appliedAfterDate = appliedAfter == null ? null : LocalDateTime.parse(appliedAfter);
        return ResponseEntity.ok(applicationService.searchApplicants(
                jobId,
                minExperience,
                skill,
                education,
                appliedAfterDate
        ));
    }


    // VIEW APPLICATIONS BY USER

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<List<Application>> getApplicationsByUser(
            @PathVariable Long userId,
            Authentication authentication) {
        validateCurrentUser(authentication, userId);

        return ResponseEntity.ok(
                applicationService.getApplicationsByUser(userId)
        );
    }


    // SHORTLIST APPLICATION

    @PutMapping("/shortlist/{applicationId}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<String> shortlist(
            @PathVariable Long applicationId) {

        applicationService.shortlistApplication(applicationId);
        return ResponseEntity.ok("Application shortlisted successfully");
    }

    @PutMapping("/reject/{applicationId}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<String> reject(
            @PathVariable Long applicationId,
            @RequestBody RejectApplicationRequest request) {

        applicationService.rejectApplication(applicationId, request.getComment());
        return ResponseEntity.ok("Application rejected successfully");
    }

    @PutMapping("/under-review/{applicationId}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<String> markUnderReview(
            @PathVariable Long applicationId,
            @RequestBody(required = false) RejectApplicationRequest request) {

        String comment = request != null ? request.getComment() : null;
        applicationService.markUnderReview(applicationId, comment);
        return ResponseEntity.ok("Application marked under review");
    }

    @PutMapping("/note/{applicationId}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<String> addEmployerNote(
            @PathVariable Long applicationId,
            @RequestBody RejectApplicationRequest request) {

        applicationService.addEmployerNote(applicationId, request.getComment());
        return ResponseEntity.ok("Application note saved");
    }

    @PutMapping("/withdraw/{applicationId}")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<String> withdraw(
            @PathVariable Long applicationId,
            @RequestBody WithdrawApplicationRequest request,
            Authentication authentication) {
        validateCurrentUser(authentication, request.getUserId());

        applicationService.withdrawApplication(
                applicationId,
                request.getUserId(),
                request.getReason());

        return ResponseEntity.ok("Application withdrawn successfully");
    }

    private void validateCurrentUser(Authentication authentication, Long userId) {
        Object principal = authentication != null ? authentication.getPrincipal() : null;
        if (!(principal instanceof AuthenticatedUser authenticatedUser) || !authenticatedUser.getUserId().equals(userId)) {
            throw new BusinessException("Unauthorized operation for current user");
        }
    }
}

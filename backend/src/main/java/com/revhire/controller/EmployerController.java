package com.revhire.controller;

import com.revhire.dto.EmployerProfileRequest;
import com.revhire.dto.JobRequest;
import com.revhire.entity.Job;
import com.revhire.exception.BusinessException;
import com.revhire.security.AuthenticatedUser;
import com.revhire.service.EmployerService;
import com.revhire.service.JobService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/employer")
@PreAuthorize("hasRole('EMPLOYER')")
public class EmployerController {

    private final JobService jobService;
    private final EmployerService employerService;

    public EmployerController(JobService jobService,
                              EmployerService employerService) {
        this.jobService = jobService;
        this.employerService = employerService;
    }

    @PostMapping("/job")
    public ResponseEntity<Job> postJob(@RequestBody JobRequest req, Authentication authentication) {
        validateCurrentUser(authentication, req.getEmployerId());
        return ResponseEntity.ok(jobService.postJob(req));
    }

    @GetMapping("/jobs")
    public List<Job> myJobs() {
        return jobService.getAllJobs();
    }

    @PutMapping("/job/{id}")
    public ResponseEntity<Job> updateJob(
            @PathVariable Long id,
            @RequestBody JobRequest req) {

        return ResponseEntity.ok(jobService.updateJob(id, req));
    }

    @PutMapping("/job/{id}/close")
    public ResponseEntity<String> closeJob(@PathVariable Long id) {
        jobService.closeJob(id);
        return ResponseEntity.ok("Job closed");
    }

    @PutMapping("/job/{id}/reopen")
    public ResponseEntity<String> reopenJob(@PathVariable Long id) {
        jobService.reopenJob(id);
        return ResponseEntity.ok("Job reopened");
    }

    @PutMapping("/job/{id}/fill")
    public ResponseEntity<String> fillJob(@PathVariable Long id) {
        jobService.fillJob(id);
        return ResponseEntity.ok("Job marked as filled");
    }

    @PutMapping("/job/{id}/mark-filled")
    public ResponseEntity<String> markJobFilled(@PathVariable Long id) {
        jobService.fillJob(id);
        return ResponseEntity.ok("Job marked as filled");
    }

    @DeleteMapping("/job/{id}")
    public ResponseEntity<String> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.ok("Job deleted");
    }

    @GetMapping("/job/{id}/statistics")
    public ResponseEntity<Map<String, Long>> getJobStats(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobStatistics(id));
    }

    @PutMapping("/company-profile")
    public ResponseEntity<String> updateCompanyProfile(
            @RequestBody EmployerProfileRequest req,
            Authentication authentication) {
        validateCurrentUser(authentication, req.userId);
        employerService.updateCompanyProfile(req);
        return ResponseEntity.ok("Company profile updated");
    }

    @GetMapping("/company-profile/{userId}")
    public ResponseEntity<EmployerProfileRequest> getCompanyProfile(
            @PathVariable Long userId,
            Authentication authentication) {
        validateCurrentUser(authentication, userId);
        return ResponseEntity.ok(employerService.getCompanyProfile(userId));
    }

    private void validateCurrentUser(Authentication authentication, Long userId) {
        Object principal = authentication != null ? authentication.getPrincipal() : null;
        if (!(principal instanceof AuthenticatedUser authenticatedUser) || !authenticatedUser.getUserId().equals(userId)) {
            throw new BusinessException("Unauthorized operation for current user");
        }
    }
}



package com.revhire.controller;

import com.revhire.dto.ApplyJobRequest;
import com.revhire.dto.RejectApplicationRequest;
import com.revhire.dto.WithdrawApplicationRequest;
import com.revhire.entity.Application;
import com.revhire.entity.Job;
import com.revhire.entity.User;
import com.revhire.exception.BusinessException;
import com.revhire.repository.JobRepository;
import com.revhire.repository.UserRepository;
import com.revhire.service.ApplicationService;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<Application> applyJob(
            @RequestBody ApplyJobRequest request) {

        Job job = jobRepo.findById(request.getJobId())
                .orElseThrow(() -> new BusinessException("Job not found"));

        User user = userRepo.findById(request.getUserId())
                .orElseThrow(() -> new BusinessException("User not found"));

        return ResponseEntity.ok(applicationService.apply(job, user, request.getCoverLetter()));
    }


    // VIEW APPLICATIONS BY JOB

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<Application>> getApplicationsByJob(
            @PathVariable Long jobId) {

        return ResponseEntity.ok(
                applicationService.getApplicationsByJob(jobId)
        );
    }

    @GetMapping("/job/{jobId}/search")
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
    public ResponseEntity<List<Application>> getApplicationsByUser(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                applicationService.getApplicationsByUser(userId)
        );
    }


    // SHORTLIST APPLICATION

    @PutMapping("/shortlist/{applicationId}")
    public ResponseEntity<String> shortlist(
            @PathVariable Long applicationId) {

        applicationService.shortlistApplication(applicationId);
        return ResponseEntity.ok("Application shortlisted successfully");
    }

    @PutMapping("/reject/{applicationId}")
    public ResponseEntity<String> reject(
            @PathVariable Long applicationId,
            @RequestBody RejectApplicationRequest request) {

        applicationService.rejectApplication(applicationId, request.getComment());
        return ResponseEntity.ok("Application rejected successfully");
    }

    @PutMapping("/withdraw/{applicationId}")
    public ResponseEntity<String> withdraw(
            @PathVariable Long applicationId,
            @RequestBody WithdrawApplicationRequest request) {

        applicationService.withdrawApplication(
                applicationId,
                request.getUserId(),
                request.getReason());

        return ResponseEntity.ok("Application withdrawn successfully");
    }
}

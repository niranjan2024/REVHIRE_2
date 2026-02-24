package com.revhire.controller;

import com.revhire.dto.JobSeekerProfileRequest;
import com.revhire.dto.JobSeekerProfileUpdateRequest;
import com.revhire.entity.Job;
import com.revhire.service.JobService;
import com.revhire.service.JobSeekerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jobseeker")
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
            @RequestBody JobSeekerProfileRequest request) {

        jobSeekerService.completeProfile(request);
        return ResponseEntity.ok("Profile completed successfully");
    }

    //  UPDATE PROFILE
    @PutMapping("/profile")
    public ResponseEntity<String> updateProfile(
            @RequestBody JobSeekerProfileUpdateRequest request) {

        jobSeekerService.updateProfile(request);
        return ResponseEntity.ok("Profile updated successfully");
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
}

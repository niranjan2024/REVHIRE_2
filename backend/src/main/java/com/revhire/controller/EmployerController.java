package com.revhire.controller;

import com.revhire.dto.EmployerProfileRequest;
import com.revhire.dto.JobRequest;
import com.revhire.entity.Job;
import com.revhire.service.EmployerService;
import com.revhire.service.JobService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/employer")
public class EmployerController {

    private final JobService jobService;
    private final EmployerService employerService;

    public EmployerController(JobService jobService,
                              EmployerService employerService) {
        this.jobService = jobService;
        this.employerService = employerService;
    }

    @PostMapping("/job")
    public ResponseEntity<Job> postJob(@RequestBody JobRequest req) {
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
            @RequestBody EmployerProfileRequest req) {
        employerService.updateCompanyProfile(req);
        return ResponseEntity.ok("Company profile updated");
    }
}



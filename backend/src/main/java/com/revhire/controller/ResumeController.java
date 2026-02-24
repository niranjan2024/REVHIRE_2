package com.revhire.controller;

import com.revhire.dto.ResumeRequest;
import com.revhire.service.ResumeService;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<String> saveResume(@RequestBody ResumeRequest request) {
        resumeService.saveResume(request);
        return ResponseEntity.ok("Resume saved successfully");
    }

    //  GET RESUME BY USER
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getResume(@PathVariable Long userId) {
        return ResponseEntity.ok(resumeService.getResumeByUser(userId));
    }
}

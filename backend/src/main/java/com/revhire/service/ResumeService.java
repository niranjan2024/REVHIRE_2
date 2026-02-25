package com.revhire.service;

import com.revhire.dto.ResumeRequest;
import com.revhire.entity.Resume;
import com.revhire.entity.User;
import com.revhire.exception.BusinessException;
import com.revhire.repository.ResumeRepository;
import com.revhire.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepo;
    private final UserRepository userRepo;

    public ResumeService(ResumeRepository resumeRepo, UserRepository userRepo) {
        this.resumeRepo = resumeRepo;
        this.userRepo = userRepo;
    }

    public void saveResume(ResumeRequest req) {

        User user = userRepo.findById(req.userId)
                .orElseThrow(() -> new BusinessException("User not found"));

        Resume resume = resumeRepo.findByUser_UserId(req.userId)
                .orElse(new Resume());

        resume.setUser(user);
        resume.setObjective(req.objective);
        resume.setEducation(join(req.education));
        resume.setExperience(join(req.experience));
        resume.setSkills(req.skills);
        resume.setProjects(join(req.projects));
        resume.setCertifications(join(req.certifications));

        resumeRepo.save(resume);
    }

    public Resume getResumeByUser(Long userId) {
        return resumeRepo.findByUser_UserId(userId)
                .orElseThrow(() -> new BusinessException("Resume not found"));
    }

    private String join(java.util.List<String> items) {
        if (items == null || items.isEmpty()) {
            return "";
        }
        return String.join(", ", items);
    }
}

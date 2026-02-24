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
        resume.setDegree(req.degree);
        resume.setInstitution(req.institution);
        resume.setStartYear(req.startYear);
        resume.setEndYear(req.endYear);
        resume.setJobTitle(req.jobTitle);
        resume.setCompany(req.company);
        resume.setExpStartDate(req.expStartDate);
        resume.setExpEndDate(req.expEndDate);
        resume.setSkills(req.skills);

        resumeRepo.save(resume);
    }

    public Resume getResumeByUser(Long userId) {
        return resumeRepo.findByUser_UserId(userId)
                .orElseThrow(() -> new BusinessException("Resume not found"));
    }
}

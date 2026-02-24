package com.revhire.service;

import com.revhire.dto.JobSeekerProfileRequest;
import com.revhire.dto.JobSeekerProfileUpdateRequest;
import com.revhire.entity.JobSeekerProfile;
import com.revhire.entity.User;
import com.revhire.exception.BusinessException;
import com.revhire.repository.JobSeekerProfileRepository;
import com.revhire.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class JobSeekerService {

    private final UserRepository userRepo;
    private final JobSeekerProfileRepository jobSeekerProfileRepo;

    public JobSeekerService(UserRepository userRepo,
                            JobSeekerProfileRepository jobSeekerProfileRepo) {
        this.userRepo = userRepo;
        this.jobSeekerProfileRepo = jobSeekerProfileRepo;
    }

    public void completeProfile(JobSeekerProfileRequest req) {

        User user = userRepo.findById(req.userId)
                .orElseThrow(() -> new BusinessException("User not found"));

        JobSeekerProfile profile = jobSeekerProfileRepo.findByUser_UserId(req.userId)
                .orElseGet(() -> {
                    JobSeekerProfile value = new JobSeekerProfile();
                    value.setUser(user);
                    return value;
                });

        profile.setFullName(req.fullName);
        profile.setPhone(req.phone);
        profile.setLocation(req.location);
        profile.setExperience(req.experience);

        jobSeekerProfileRepo.save(profile);
    }

    public void updateProfile(JobSeekerProfileUpdateRequest req) {

        User user = userRepo.findById(req.userId)
                .orElseThrow(() -> new BusinessException("User not found"));

        JobSeekerProfile profile = jobSeekerProfileRepo.findByUser_UserId(req.userId)
                .orElseGet(() -> {
                    JobSeekerProfile value = new JobSeekerProfile();
                    value.setUser(user);
                    return value;
                });

        if (req.phone != null)
            profile.setPhone(req.phone);

        if (req.location != null)
            profile.setLocation(req.location);

        if (req.experience >= 0)
            profile.setExperience(req.experience);

        jobSeekerProfileRepo.save(profile);
    }

}


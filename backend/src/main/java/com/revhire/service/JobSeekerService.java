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

        if (req.email != null)
            user.setEmail(req.email);

        if (req.phone != null)
            user.setMobileNumber(req.phone);

        userRepo.save(user);

        profile.setFullName(req.fullName);
        profile.setEmail(req.email);
        profile.setPhone(req.phone);
        profile.setLocation(req.location);
        profile.setEmploymentStatus(req.employmentStatus);
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

    public JobSeekerProfileRequest getProfile(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found"));

        JobSeekerProfile profile = jobSeekerProfileRepo.findByUser_UserId(userId)
                .orElseGet(() -> {
                    JobSeekerProfile value = new JobSeekerProfile();
                    value.setUser(user);
                    value.setFullName(user.getUsername());
                    value.setEmail(user.getEmail());
                    value.setPhone(user.getMobileNumber());
                    return value;
                });

        JobSeekerProfileRequest response = new JobSeekerProfileRequest();
        response.userId = userId;
        response.fullName = profile.getFullName() != null ? profile.getFullName() : user.getUsername();
        response.email = profile.getEmail() != null ? profile.getEmail() : user.getEmail();
        response.phone = profile.getPhone() != null ? profile.getPhone() : user.getMobileNumber();
        response.location = profile.getLocation();
        response.employmentStatus = profile.getEmploymentStatus();
        response.experience = profile.getExperience();
        return response;
    }

}


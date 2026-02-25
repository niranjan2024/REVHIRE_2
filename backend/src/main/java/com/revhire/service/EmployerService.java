package com.revhire.service;

import com.revhire.dto.EmployerProfileRequest;
import com.revhire.entity.EmployerProfile;
import com.revhire.entity.User;
import com.revhire.exception.BusinessException;
import com.revhire.repository.EmployerProfileRepository;
import com.revhire.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class EmployerService {

    private final UserRepository userRepo;
    private final EmployerProfileRepository employerProfileRepo;

    public EmployerService(UserRepository userRepo,
                           EmployerProfileRepository employerProfileRepo) {
        this.userRepo = userRepo;
        this.employerProfileRepo = employerProfileRepo;
    }

    public void updateCompanyProfile(EmployerProfileRequest req) {
        User user = userRepo.findById(req.userId)
                .orElseThrow(() -> new BusinessException("Employer not found"));

        user.setEmail(req.email);
        user.setMobileNumber(req.mobileNumber);
        userRepo.save(user);

        EmployerProfile profile = employerProfileRepo.findByUser_UserId(req.userId)
                .orElseGet(() -> {
                    EmployerProfile value = new EmployerProfile();
                    value.setUser(user);
                    return value;
                });

        profile.setCompanyName(req.companyName);
        profile.setIndustry(req.industry);
        profile.setCompanySize(req.companySize);
        profile.setCompanyDescription(req.companyDescription);
        profile.setWebsite(req.website);
        profile.setCompanyLocation(req.companyLocation);
        employerProfileRepo.save(profile);
    }

    public EmployerProfileRequest getCompanyProfile(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new BusinessException("Employer not found"));

        EmployerProfile profile = employerProfileRepo.findByUser_UserId(userId)
                .orElseGet(() -> {
                    EmployerProfile value = new EmployerProfile();
                    value.setUser(user);
                    value.setContactName(user.getUsername());
                    return value;
                });

        EmployerProfileRequest response = new EmployerProfileRequest();
        response.userId = userId;
        response.email = user.getEmail();
        response.mobileNumber = user.getMobileNumber();
        response.companyName = profile.getCompanyName();
        response.industry = profile.getIndustry();
        response.companySize = profile.getCompanySize();
        response.companyDescription = profile.getCompanyDescription();
        response.website = profile.getWebsite();
        response.companyLocation = profile.getCompanyLocation();
        return response;
    }
}

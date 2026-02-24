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
}

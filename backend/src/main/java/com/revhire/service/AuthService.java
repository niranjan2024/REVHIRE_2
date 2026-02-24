package com.revhire.service;

import org.springframework.stereotype.Service;

import com.revhire.dto.LoginRequest;
import com.revhire.dto.LoginResponse;
import com.revhire.dto.RegisterRequest;
import com.revhire.entity.EmployerProfile;
import com.revhire.entity.JobSeekerProfile;
import com.revhire.entity.User;
import com.revhire.exception.BusinessException;
import com.revhire.repository.EmployerProfileRepository;
import com.revhire.repository.JobSeekerProfileRepository;
import com.revhire.repository.UserRepository;
import com.revhire.util.InputValidator;
import com.revhire.util.PasswordUtil;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final JobSeekerProfileRepository jobSeekerProfileRepo;
    private final EmployerProfileRepository employerProfileRepo;

    public AuthService(UserRepository userRepo,
                       JobSeekerProfileRepository jobSeekerProfileRepo,
                       EmployerProfileRepository employerProfileRepo) {
        this.userRepo = userRepo;
        this.jobSeekerProfileRepo = jobSeekerProfileRepo;
        this.employerProfileRepo = employerProfileRepo;
    }

    public void register(RegisterRequest req) {

        if (req.password == null || !InputValidator.isStrongPassword(req.password))
            throw new BusinessException("Password must be at least 6 characters");

        if (req.confirmPassword == null || !req.password.equals(req.confirmPassword))
            throw new BusinessException("Password and confirm password do not match");

        if (req.username == null || req.username.isBlank())
            throw new BusinessException("Username is required");

        if (req.role == null || req.role.isBlank())
            throw new BusinessException("Role is required");

        if (!InputValidator.isValidMobileNumber(req.mobileNumber))
            throw new BusinessException("Mobile number must be 10 digits");

        if (req.securityQuestion == null || req.securityQuestion.isBlank()
                || req.securityAnswer == null || req.securityAnswer.isBlank()) {
            throw new BusinessException("Security question and answer are required");
        }

        if (req.email != null && !req.email.isBlank() && !InputValidator.isValidEmail(req.email)) {
            throw new BusinessException("Invalid email");
        }

        if (userRepo.findByUsername(req.username).isPresent())
            throw new BusinessException("Username already taken");

        User user = new User();
        user.setUsername(req.username);
        user.setEmail(req.email);
        user.setPassword(PasswordUtil.hashPassword(req.password));
        user.setMobileNumber(req.mobileNumber);
        user.setRole(req.role);
        user.setSecurityQuestion(req.securityQuestion);
        user.setSecurityAnswer(req.securityAnswer);

        User savedUser = userRepo.save(user);

        if ("EMPLOYER".equalsIgnoreCase(req.role)) {
            EmployerProfile employerProfile = new EmployerProfile();
            employerProfile.setUser(savedUser);
            employerProfile.setContactName(req.fullName != null && !req.fullName.isBlank() ? req.fullName : req.username);
            employerProfile.setCompanyName(req.companyName);
            employerProfile.setIndustry(req.industry);
            employerProfile.setWebsite(req.website);
            employerProfile.setCompanyLocation(req.companyLocation);
            employerProfile.setCompanySize(req.companySize);
            employerProfile.setCompanyDescription(req.companyDescription);
            employerProfileRepo.save(employerProfile);
        } else if ("JOB_SEEKER".equalsIgnoreCase(req.role)) {
            JobSeekerProfile jobSeekerProfile = new JobSeekerProfile();
            jobSeekerProfile.setUser(savedUser);
            jobSeekerProfile.setFullName(req.fullName != null ? req.fullName : req.username);
            jobSeekerProfile.setLocation(req.location);
            jobSeekerProfile.setEmploymentStatus(req.employmentStatus);
            jobSeekerProfile.setEmail(req.email);
            jobSeekerProfile.setPhone(req.mobileNumber);
            jobSeekerProfileRepo.save(jobSeekerProfile);
        } else {
            throw new BusinessException("Role must be JOB_SEEKER or EMPLOYER");
        }
    }

    public LoginResponse login(LoginRequest req) {
        if (req.username == null || req.username.isBlank() || req.password == null || req.password.isBlank()) {
            throw new BusinessException("Email and password are required");
        }

        String loginInput = req.username.trim();
        String hashedPassword = PasswordUtil.hashPassword(req.password);

        User user = userRepo
                .findByUsernameAndPassword(loginInput, hashedPassword)
                .or(() -> userRepo.findByEmailAndPassword(loginInput, hashedPassword))
                .orElseThrow(() ->
                        new BusinessException("Invalid credentials"));

        LoginResponse response = new LoginResponse();
        response.userId = user.getUserId();
        response.username = user.getUsername();
        response.role = user.getRole();
        response.fullName = jobSeekerProfileRepo.findByUser_UserId(user.getUserId())
                .map(JobSeekerProfile::getFullName)
                .or(() -> employerProfileRepo.findByUser_UserId(user.getUserId()).map(EmployerProfile::getContactName))
                .or(() -> employerProfileRepo.findByUser_UserId(user.getUserId()).map(EmployerProfile::getCompanyName))
                .filter(name -> name != null && !name.isBlank())
                .orElse(user.getUsername());
        return response;
    }

    public String getSecurityQuestion(String username) {

        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found"));

        return user.getSecurityQuestion();
    }

    public void resetPassword(String username, String answer, String newPassword) {

        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found"));

        if (!user.getSecurityAnswer().equals(answer))
            throw new BusinessException("Wrong security answer");

        user.setPassword(PasswordUtil.hashPassword(newPassword));
        userRepo.save(user);
    }

    public void changePassword(String username, String oldPassword, String newPassword) {

        User user = userRepo.findByUsername(username)
                .filter(value -> value.getPassword().equals(PasswordUtil.hashPassword(oldPassword)))
                .orElseThrow(() -> new BusinessException("Invalid old password"));

        user.setPassword(PasswordUtil.hashPassword(newPassword));
        userRepo.save(user);
    }

    public int getProfileCompletion(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found"));

        int total = 0;
        int filled = 0;

        total++;
        if (user.getUsername() != null && !user.getUsername().isBlank()) filled++;
        total++;
        if (user.getMobileNumber() != null && !user.getMobileNumber().isBlank()) filled++;

        if ("EMPLOYER".equalsIgnoreCase(user.getRole())) {
            EmployerProfile profile = employerProfileRepo.findByUser_UserId(userId).orElse(null);
            total++;
            if (profile != null && profile.getCompanyName() != null && !profile.getCompanyName().isBlank()) filled++;
            total++;
            if (profile != null && profile.getIndustry() != null && !profile.getIndustry().isBlank()) filled++;
            total++;
            if (profile != null && profile.getWebsite() != null && !profile.getWebsite().isBlank()) filled++;
            total++;
            if (profile != null && profile.getCompanyLocation() != null && !profile.getCompanyLocation().isBlank()) filled++;
        } else {
            JobSeekerProfile profile = jobSeekerProfileRepo.findByUser_UserId(userId).orElse(null);
            total++;
            if (profile != null && profile.getFullName() != null && !profile.getFullName().isBlank()) filled++;
            total++;
            if (profile != null && profile.getPhone() != null && !profile.getPhone().isBlank()) filled++;
            total++;
            if (profile != null && profile.getLocation() != null && !profile.getLocation().isBlank()) filled++;
        }

        return (int) Math.round((filled * 100.0) / total);
    }
}

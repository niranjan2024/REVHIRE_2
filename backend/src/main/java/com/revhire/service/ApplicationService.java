package com.revhire.service;

import com.revhire.exception.BusinessException;
import com.revhire.repository.JobSeekerProfileRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.revhire.entity.Application;
import com.revhire.entity.Job;
import com.revhire.entity.Resume;
import com.revhire.entity.User;
import com.revhire.repository.ApplicationRepository;
import com.revhire.repository.ResumeRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private static final Logger log =
            LoggerFactory.getLogger(ApplicationService.class);

    private final ApplicationRepository appRepo;
    private final NotificationService notificationService;
    private final ResumeRepository resumeRepo;
    private final JobSeekerProfileRepository jobSeekerProfileRepo;

    public ApplicationService(ApplicationRepository appRepo,
                              NotificationService notificationService,
                              ResumeRepository resumeRepo,
                              JobSeekerProfileRepository jobSeekerProfileRepo) {
        this.appRepo = appRepo;
        this.notificationService = notificationService;
        this.resumeRepo = resumeRepo;
        this.jobSeekerProfileRepo = jobSeekerProfileRepo;
    }

    public Application apply(Job job, User user, String coverLetter) {
        log.info("Applying for jobId={} by userId={}",
                job.getJobId(), user.getUserId());

        boolean alreadyApplied = appRepo.existsByJob_JobIdAndUser_UserIdAndStatusNot(
                job.getJobId(),
                user.getUserId(),
                "WITHDRAWN");

        if (alreadyApplied) {
            throw new BusinessException("You have already applied for this job.");
        }

        Application app = new Application();
        app.setJob(job);
        app.setUser(user);
        app.setStatus("APPLIED");
        app.setCoverLetter(coverLetter);
        app.setAppliedAt(LocalDateTime.now());

        Application savedApp = appRepo.save(app);

        if (job.getEmployer() != null) {
            notificationService.notify(
                    job.getEmployer(),
                    "New application received for job: " + job.getTitle()
            );
        }

        return savedApp;
    }

    public List<Application> getApplicationsByJob(Long jobId) {
        List<Application> applications = appRepo.findByJob_JobId(jobId);
        applications.forEach(this::attachSeekerDetails);
        return applications;
    }

    @Transactional
    public void shortlistApplication(Long applicationId) {

        Application app = appRepo.findById(applicationId)
                .orElseThrow(() -> new BusinessException("Application not found"));

        app.setStatus("SHORTLISTED");

        notificationService.notify(
                app.getUser(),
                "You have been shortlisted for job: " + app.getJob().getTitle()
        );

        appRepo.save(app);
    }

    @Transactional
    public void markUnderReview(Long applicationId, String comment) {
        Application app = appRepo.findById(applicationId)
                .orElseThrow(() -> new BusinessException("Application not found"));

        app.setStatus("UNDER_REVIEW");

        if (comment != null && !comment.isBlank()) {
            app.setEmployerComment(comment);
        }

        appRepo.save(app);
    }

    public List<Application> getApplicationsByUser(Long userId) {
        List<Application> applications = appRepo.findByUser_UserId(userId);
        applications.forEach(this::attachSeekerDetails);
        return applications;
    }

    @Transactional
    public void rejectApplication(Long applicationId, String comment) {
        Application app = appRepo.findById(applicationId)
                .orElseThrow(() -> new BusinessException("Application not found"));

        app.setStatus("REJECTED");
        app.setEmployerComment(comment);
        app.setStatusReason(comment);

        appRepo.save(app);

        notificationService.notify(
                app.getUser(),
                "Your application was rejected for job: " + app.getJob().getTitle()
        );
    }

    @Transactional
    public void addEmployerNote(Long applicationId, String note) {
        Application app = appRepo.findById(applicationId)
                .orElseThrow(() -> new BusinessException("Application not found"));

        app.setEmployerComment(note);
        appRepo.save(app);
    }

    @Transactional
    public void withdrawApplication(Long applicationId, Long userId, String reason) {
        Application app = appRepo.findById(applicationId)
                .orElseThrow(() -> new BusinessException("Application not found"));

        if (!app.getUser().getUserId().equals(userId))
            throw new BusinessException("You can withdraw only your own application");

        app.setStatus("WITHDRAWN");
        app.setStatusReason(reason);
        app.setWithdrawnAt(LocalDateTime.now());

        appRepo.save(app);

        if (app.getJob().getEmployer() != null) {
            notificationService.notify(
                    app.getJob().getEmployer(),
                    "Candidate withdrew application for job: " + app.getJob().getTitle()
            );
        }
    }

    public List<Application> searchApplicants(
            Long jobId,
            Integer minExperience,
            String skill,
            String education,
            LocalDateTime appliedAfter) {

        List<Application> applications = appRepo.findByJob_JobId(jobId);

        return applications.stream()
                .filter(app -> minExperience == null || hasMinExperience(app.getUser().getUserId(), minExperience))
                .filter(app -> appliedAfter == null || (app.getAppliedAt() != null && !app.getAppliedAt().isBefore(appliedAfter)))
                .filter(app -> education == null || matchesEducation(app.getUser().getUserId(), education))
                .filter(app -> skill == null || matchesSkill(app.getUser().getUserId(), skill))
                .collect(Collectors.toList());
    }

    private boolean hasMinExperience(Long userId, Integer minExperience) {
        return jobSeekerProfileRepo.findByUser_UserId(userId)
                .map(profile -> profile.getExperience() >= minExperience)
                .orElse(false);
    }
    
    private boolean matchesEducation(Long userId, String education) {
        Optional<Resume> resume = resumeRepo.findByUser_UserId(userId);

        return resume.map(r ->
                r.getEducation() != null &&
                        r.getEducation().toLowerCase(Locale.ROOT)
                                .contains(education.toLowerCase(Locale.ROOT))
        ).orElse(false);
    }

    private boolean matchesSkill(Long userId, String skill) {
        Optional<Resume> resume = resumeRepo.findByUser_UserId(userId);

        return resume.map(r ->
                r.getSkills() != null &&
                        r.getSkills().stream()
                                .anyMatch(s -> s != null &&
                                        s.toLowerCase(Locale.ROOT)
                                                .contains(skill.toLowerCase(Locale.ROOT)))
        ).orElse(false);
    }

    private void attachSeekerDetails(Application application) {

        Long userId = application.getUser() != null
                ? application.getUser().getUserId()
                : null;

        if (userId == null) return;

        jobSeekerProfileRepo.findByUser_UserId(userId).ifPresent(profile -> {
            application.setSeekerExperienceYears(profile.getExperience());
            application.setSeekerFullName(profile.getFullName());
        });

        resumeRepo.findByUser_UserId(userId).ifPresent(resume -> {
            if (resume.getSkills() != null) {
                application.setSeekerSkills(resume.getSkills());
            }
        });
    }
}
package com.revhire.service;

import com.revhire.dto.JobRequest;
import com.revhire.entity.JobSeekerProfile;
import com.revhire.entity.Job;
import com.revhire.entity.User;
import com.revhire.exception.BusinessException;
import com.revhire.repository.ApplicationRepository;
import com.revhire.repository.JobSeekerProfileRepository;
import com.revhire.repository.JobRepository;
import com.revhire.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class JobService {

    private final JobRepository jobRepo;
    private final UserRepository userRepo;
    private final JobSeekerProfileRepository jobSeekerProfileRepo;
    private final ApplicationRepository appRepo;
    private final NotificationService notificationService;

    public JobService(JobRepository jobRepo,
                      UserRepository userRepo,
                      JobSeekerProfileRepository jobSeekerProfileRepo,
                      ApplicationRepository appRepo,
                      NotificationService notificationService) {
        this.jobRepo = jobRepo;
        this.userRepo = userRepo;
        this.jobSeekerProfileRepo = jobSeekerProfileRepo;
        this.appRepo = appRepo;
        this.notificationService = notificationService;
    }

    public Job postJob(JobRequest req) {
        User employer = userRepo.findById(req.getEmployerId())
                .orElseThrow(() -> new BusinessException("Employer not found"));

        Job job = new Job();
        job.setEmployer(employer);
        job.setTitle(req.getTitle());
        job.setDescription(req.getDescription());
        job.setCompanyName(req.getCompanyName());
        job.setEducation(req.getEducation());
        job.setRequiredExperienceYears(req.getRequiredExperienceYears());
        job.setLocation(req.getLocation());
        job.setSalaryMin(req.getSalaryMin());
        job.setSalaryMax(req.getSalaryMax());
        job.setJobType(req.getJobType());
        job.setDeadline(req.getDeadline());
        job.setRequiredSkills(req.getRequiredSkills());
        job.setStatus("OPEN");

        Job saved = jobRepo.save(job);
        notifyMatchingJobSeekers(saved);
        return saved;
    }

    public List<Job> getAllJobs() {
        return jobRepo.findAll();
    }

    public void closeJob(Long id) {

        Job job = jobRepo.findById(id)
                .orElseThrow(() -> new BusinessException("Job not found"));

        job.setStatus("CLOSED");
        jobRepo.save(job);
    }

    public Job updateJob(Long id, JobRequest req) {

        Job job = jobRepo.findById(id)
                .orElseThrow(() -> new BusinessException("Job not found"));

        if (req.getTitle() != null)
            job.setTitle(req.getTitle());

        if (req.getDescription() != null)
            job.setDescription(req.getDescription());

        if (req.getLocation() != null)
            job.setLocation(req.getLocation());

        if (req.getCompanyName() != null)
            job.setCompanyName(req.getCompanyName());

        if (req.getEducation() != null)
            job.setEducation(req.getEducation());

        if (req.getRequiredExperienceYears() != null)
            job.setRequiredExperienceYears(req.getRequiredExperienceYears());

        if (req.getSalaryMin() != null)
            job.setSalaryMin(req.getSalaryMin());

        if (req.getSalaryMax() != null)
            job.setSalaryMax(req.getSalaryMax());

        if (req.getJobType() != null)
            job.setJobType(req.getJobType());

        if (req.getDeadline() != null)
            job.setDeadline(req.getDeadline());

        if (req.getRequiredSkills() != null)
            job.setRequiredSkills(req.getRequiredSkills());

        return jobRepo.save(job);
    }

    public void reopenJob(Long id) {
        Job job = jobRepo.findById(id)
                .orElseThrow(() -> new BusinessException("Job not found"));

        job.setStatus("OPEN");
        jobRepo.save(job);
    }

    public void fillJob(Long id) {
        Job job = jobRepo.findById(id)
                .orElseThrow(() -> new BusinessException("Job not found"));

        job.setStatus("FILLED");
        jobRepo.save(job);
    }

    @Transactional
    public void deleteJob(Long id) {
        if (!jobRepo.existsById(id))
            throw new BusinessException("Job not found");

        appRepo.deleteAllByJobId(id);
        jobRepo.deleteById(id);
    }

    public Map<String, Long> getJobStatistics(Long id) {
        if (!jobRepo.existsById(id))
            throw new BusinessException("Job not found");

        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("totalApplications", appRepo.countByJob_JobId(id));
        stats.put("applied", appRepo.countByJob_JobIdAndStatus(id, "APPLIED"));
        stats.put("shortlisted", appRepo.countByJob_JobIdAndStatus(id, "SHORTLISTED"));
        stats.put("rejected", appRepo.countByJob_JobIdAndStatus(id, "REJECTED"));
        stats.put("withdrawn", appRepo.countByJob_JobIdAndStatus(id, "WITHDRAWN"));
        return stats;
    }

    public List<Job> searchJobs(
            String title,
            String location,
            Integer experienceYears,
            String companyName,
            Double minSalary,
            Double maxSalary,
            String jobType) {

        return jobRepo.searchJobs(
                title,
                location,
                experienceYears,
                companyName,
                minSalary,
                maxSalary,
                jobType);
    }

    private void notifyMatchingJobSeekers(Job job) {
        List<JobSeekerProfile> seekerProfiles = jobSeekerProfileRepo.findAll();
        for (JobSeekerProfile profile : seekerProfiles) {
            User user = profile.getUser();
            if (user == null || !"JOB_SEEKER".equalsIgnoreCase(user.getRole()))
                continue;

            boolean experienceMatch = job.getRequiredExperienceYears() == null
                    || profile.getExperience() >= job.getRequiredExperienceYears();

            boolean locationMatch = job.getLocation() == null
                    || profile.getLocation() == null
                    || profile.getLocation().equalsIgnoreCase(job.getLocation());

            if (experienceMatch && locationMatch) {
                notificationService.notify(
                        user,
                        "New job match: " + job.getTitle() + " at " + job.getCompanyName()
                );
            }
        }
    }
}

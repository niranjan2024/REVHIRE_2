package com.revhire.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.revhire.entity.Job;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    @Query("""
        SELECT j FROM Job j
        WHERE (:title IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :title, '%')))
          AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%')))
          AND (:companyName IS NULL OR LOWER(j.companyName) LIKE LOWER(CONCAT('%', :companyName, '%')))
          AND (:jobType IS NULL OR LOWER(j.jobType) = LOWER(:jobType))
          AND (:experienceYears IS NULL OR j.requiredExperienceYears <= :experienceYears)
          AND (:minSalary IS NULL OR j.salaryMax >= :minSalary)
          AND (:maxSalary IS NULL OR j.salaryMin <= :maxSalary)
          AND j.status = 'OPEN'
        """)
    List<Job> searchJobs(
            @Param("title") String title,
            @Param("location") String location,
            @Param("experienceYears") Integer experienceYears,
            @Param("companyName") String companyName,
            @Param("minSalary") Double minSalary,
            @Param("maxSalary") Double maxSalary,
            @Param("jobType") String jobType
    );
}

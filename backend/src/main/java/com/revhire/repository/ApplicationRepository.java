package com.revhire.repository;

import com.revhire.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByJob_JobId(Long jobId);
    List<Application> findByUser_UserId(Long userId);
    @Modifying
    @Transactional
    @Query("delete from Application a where a.job.jobId = :jobId")
    int deleteAllByJobId(@Param("jobId") Long jobId);
    boolean existsByJob_JobIdAndUser_UserIdAndStatusNot(Long jobId, Long userId, String status);
    long countByJob_JobId(Long jobId);
    long countByJob_JobIdAndStatus(Long jobId, String status);
}

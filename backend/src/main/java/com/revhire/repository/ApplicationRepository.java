package com.revhire.repository;

import com.revhire.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByJob_JobId(Long jobId);
    List<Application> findByUser_UserId(Long userId);
    boolean existsByJob_JobIdAndUser_UserIdAndStatusNot(Long jobId, Long userId, String status);
    long countByJob_JobId(Long jobId);
    long countByJob_JobIdAndStatus(Long jobId, String status);
}

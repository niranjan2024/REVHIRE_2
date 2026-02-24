package com.revhire.repository;

import com.revhire.entity.EmployerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployerProfileRepository extends JpaRepository<EmployerProfile, Long> {
    Optional<EmployerProfile> findByUser_UserId(Long userId);
}

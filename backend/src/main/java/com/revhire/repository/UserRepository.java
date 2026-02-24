package com.revhire.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.revhire.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsernameAndPassword(String username, String password);
    Optional<User> findByEmailAndPassword(String email, String password);
    Optional<User> findByUsername(String username);
}

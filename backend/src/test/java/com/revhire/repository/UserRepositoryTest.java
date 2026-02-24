package com.revhire.repository;

import com.revhire.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void testSaveUser() {
        User user = new User();
        user.setUsername("niranjan");
        user.setPassword("hashed123");
        user.setMobileNumber("9999999999");
        user.setSecurityQuestion("pet");
        user.setSecurityAnswer("dog");
        user.setRole("JOB_SEEKER");

        User savedUser = userRepository.save(user);

        assertThat(savedUser.getUserId()).isNotNull();
    }
}

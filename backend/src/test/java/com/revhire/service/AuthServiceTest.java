package com.revhire.service;

import com.revhire.dto.LoginRequest;
import com.revhire.dto.LoginResponse;
import com.revhire.dto.RegisterRequest;
import com.revhire.entity.User;
import com.revhire.exception.BusinessException;
import com.revhire.repository.EmployerProfileRepository;
import com.revhire.repository.JobSeekerProfileRepository;
import com.revhire.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthService authService;

    @Mock
    private JobSeekerProfileRepository jobSeekerProfileRepository;

    @Mock
    private EmployerProfileRepository employerProfileRepository;

    @Test
    void register_success() {
        RegisterRequest req = new RegisterRequest();
        req.username = "test";
        req.password = "Test@123";
        req.confirmPassword = "Test@123";
        req.mobileNumber = "9999999999";
        req.role = "JOB_SEEKER";
        req.securityQuestion = "pet";
        req.securityAnswer = "dog";

        when(userRepository.findByUsername(req.username)).thenReturn(Optional.empty());

        authService.register(req);

        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void login_success() {
        LoginRequest req = new LoginRequest();
        req.username = "test";
        req.password = "Test@123";

        User user = new User();
        user.setUsername(req.username);

        when(userRepository.findByUsernameAndPassword(any(), any()))
                .thenReturn(Optional.of(user));
        when(jobSeekerProfileRepository.findByUser_UserId(any()))
                .thenReturn(Optional.empty());

        LoginResponse result = authService.login(req);

        assertNotNull(result);
        assertEquals(req.username, result.username);
    }

    @Test
    void login_invalidCredentials() {
        LoginRequest req = new LoginRequest();
        req.username = "wrong";
        req.password = "wrong";

        when(userRepository.findByUsernameAndPassword(any(), any()))
                .thenReturn(Optional.empty());

        assertThrows(BusinessException.class, () -> authService.login(req));
    }
}

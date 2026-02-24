package com.revhire.service;

import com.revhire.dto.JobRequest;
import com.revhire.entity.Job;
import com.revhire.entity.User;
import com.revhire.exception.BusinessException;
import com.revhire.repository.ApplicationRepository;
import com.revhire.repository.JobSeekerProfileRepository;
import com.revhire.repository.JobRepository;
import com.revhire.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private JobSeekerProfileRepository jobSeekerProfileRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private JobService jobService;

    @Test
    void postJob_success() {
        JobRequest req = new JobRequest();
        req.setTitle("Java Dev");
        req.setDescription("Spring Boot");
        req.setLocation("Bangalore");
        req.setEmployerId(10L);

        User employer = new User();
        employer.setUserId(10L);

        when(jobRepository.save(any(Job.class)))
                .thenAnswer(i -> i.getArgument(0));
        when(userRepository.findById(10L)).thenReturn(Optional.of(employer));
        when(userRepository.findAll()).thenReturn(List.of());

        Job job = jobService.postJob(req);

        assertEquals("Java Dev", job.getTitle());
        assertEquals("OPEN", job.getStatus());
    }

    @Test
    void closeJob_notFound() {
        when(jobRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(BusinessException.class,
                () -> jobService.closeJob(1L));
    }
}

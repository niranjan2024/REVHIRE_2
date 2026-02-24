package com.revhire.service;

import com.revhire.entity.Application;
import com.revhire.entity.Job;
import com.revhire.entity.User;
import com.revhire.exception.BusinessException;
import com.revhire.repository.ApplicationRepository;
import com.revhire.repository.JobSeekerProfileRepository;
import com.revhire.repository.ResumeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private ApplicationRepository appRepo;

    @Mock
    private NotificationService notificationService;

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private JobSeekerProfileRepository jobSeekerProfileRepository;

    @InjectMocks
    private ApplicationService applicationService;

    // POSITIVE CASE
    @Test
    void shortlist_success() {
        Application app = new Application();

        Job job = new Job();
        job.setTitle("Java Developer");

        User user = new User();

        app.setJob(job);
        app.setUser(user);
        app.setStatus("APPLIED");

        when(appRepo.findById(1L))
                .thenReturn(Optional.of(app));

        applicationService.shortlistApplication(1L);

        assertEquals("SHORTLISTED", app.getStatus());
        verify(notificationService, times(1)).notify(any(), any());
    }

    // NEGATIVE CASE
    @Test
    void shortlist_application_not_found() {
        when(appRepo.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                BusinessException.class,
                () -> applicationService.shortlistApplication(99L)
        );

        verify(notificationService, never()).notify(any(), any());
    }
}

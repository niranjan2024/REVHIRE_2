package com.revhire.controller;

import com.revhire.entity.Notification;
import com.revhire.exception.BusinessException;
import com.revhire.security.AuthenticatedUser;
import com.revhire.service.NotificationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@PreAuthorize("hasAnyRole('JOB_SEEKER','EMPLOYER')")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/user/{userId}")
    public List<Notification> getUserNotifications(@PathVariable Long userId, Authentication authentication) {
        Object principal = authentication != null ? authentication.getPrincipal() : null;
        if (!(principal instanceof AuthenticatedUser authenticatedUser) || !authenticatedUser.getUserId().equals(userId)) {
            throw new BusinessException("Unauthorized operation for current user");
        }
        return notificationService.getNotificationsByUser(userId);
    }
}

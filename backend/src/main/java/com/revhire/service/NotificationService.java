package com.revhire.service;

import org.springframework.stereotype.Service;

import com.revhire.entity.Notification;
import com.revhire.entity.User;
import com.revhire.repository.NotificationRepository;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository repo;

    public NotificationService(NotificationRepository repo) {
        this.repo = repo;
    }

    public void notify(User user, String message) {
        Notification n = new Notification();
        n.setUser(user);
        n.setMessage(message);
        n.setRead(false);
        repo.save(n);
    }

    public List<Notification> getNotificationsByUser(Long userId) {
        return repo.findByUser_UserId(userId);
    }
}

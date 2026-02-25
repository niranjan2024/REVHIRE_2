package com.revhire.dto;

import com.revhire.entity.Role;

public class AuthResponse {
    private final Long userId;
    private final String username;
    private final String email;
    private final Role role;

    public AuthResponse(Long userId, String username, String email, Role role) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }
}

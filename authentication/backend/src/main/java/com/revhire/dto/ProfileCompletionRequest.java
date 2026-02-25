package com.revhire.dto;

import jakarta.validation.constraints.NotNull;

public class ProfileCompletionRequest {

    @NotNull
    private Boolean profileCompleted;

    public Boolean getProfileCompleted() {
        return profileCompleted;
    }

    public void setProfileCompleted(Boolean profileCompleted) {
        this.profileCompleted = profileCompleted;
    }
}

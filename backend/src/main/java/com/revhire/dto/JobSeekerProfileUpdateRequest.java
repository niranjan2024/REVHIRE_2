package com.revhire.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JobSeekerProfileUpdateRequest {

    public Long userId;
    public String phone;
    public String location;
    public int experience;
}

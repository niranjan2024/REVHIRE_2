package com.revhire.dto;

import java.util.List;

public class ResumeRequest {

    public Long userId;
    public String objective;

    // Education
    public String degree;
    public String institution;
    public String startYear;
    public String endYear;

    // Experience
    public String jobTitle;
    public String company;
    public String expStartDate;
    public String expEndDate;

    // Skills
    public List<String> skills;
}

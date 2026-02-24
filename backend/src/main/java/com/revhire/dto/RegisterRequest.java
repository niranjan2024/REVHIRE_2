package com.revhire.dto;

public class RegisterRequest {
    public String username;
    public String email;
    public String password;
    public String confirmPassword;
    public String mobileNumber;
    public String securityQuestion;
    public String securityAnswer;
    public String role;

    // Optional job seeker field
    public String fullName;
    public String location;
    public String employmentStatus;

    // Optional employer company fields
    public String companyName;
    public String industry;
    public String companySize;
    public String companyDescription;
    public String website;
    public String companyLocation;
}

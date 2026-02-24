package com.revhire.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "job_listings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long jobId;

    private String title;
    private String description;
    private String companyName;
    private String location;
    private String education;
    private Integer requiredExperienceYears;
    private Double salaryMin;
    private Double salaryMax;
    private String jobType;
    private LocalDate deadline;
    private String status;

    @ElementCollection
    private List<String> requiredSkills;

    @ManyToOne
    @JoinColumn(name = "employer_id")
    private User employer;
}

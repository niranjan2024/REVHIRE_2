package com.revhire.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "resumes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long resumeId;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String objective;

    // Education
    private String degree;
    private String institution;
    private String startYear;
    private String endYear;

    // Experience
    private String jobTitle;
    private String company;
    private String expStartDate;
    private String expEndDate;

    // Skills
    @ElementCollection
    private List<String> skills;
}

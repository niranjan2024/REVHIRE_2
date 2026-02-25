package com.revhire.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long applicationId;

    private String status;
    private String coverLetter;
    private String statusReason;
    private String employerComment;
    private LocalDateTime appliedAt;
    private LocalDateTime withdrawnAt;

    @ManyToOne
    @JoinColumn(name = "job_id")
    private Job job;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Transient
    private String seekerFullName;

    @Transient
    private Integer seekerExperienceYears;

    @Transient
    private List<String> seekerSkills;
}

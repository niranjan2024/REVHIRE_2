package com.revhire.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "resume_builder")
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

    @Column(name = "objective", columnDefinition = "TEXT")
    private String objective;

    @Column(name = "education", columnDefinition = "TEXT")
    private String education;

    @Column(name = "experience", columnDefinition = "TEXT")
    private String experience;

    @ElementCollection
    @CollectionTable(name = "resume_builder_skills", joinColumns = @JoinColumn(name = "resume_id"))
    @Column(name = "skill")
    private List<String> skills;

    @Column(name = "projects", columnDefinition = "TEXT")
    private String projects;

    @Column(name = "certifications", columnDefinition = "TEXT")
    private String certifications;
}

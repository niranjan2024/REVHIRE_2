package com.revhire.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_seekers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobSeekerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "job_seeker_id")
    private Long id;

    @OneToOne
    @JoinColumn(name = "auth_id", nullable = false, unique = true)
    private User user;

    @Column(name = "name")
    private String fullName;

    private String email;
    private String phone;
    private String location;
    @Column(name = "employment_status")
    private String employmentStatus;
    private int experience;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}

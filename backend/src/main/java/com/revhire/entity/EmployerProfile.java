package com.revhire.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "employers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employer_id")
    private Long id;

    @OneToOne
    @JoinColumn(name = "auth_id", nullable = false, unique = true)
    private User user;

    private String companyName;
    private String industry;
    private String companySize;
    private String companyDescription;
    private String website;
    @Column(name = "location")
    private String companyLocation;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}

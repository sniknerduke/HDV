package com.example.onlineCourses.model;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
public class VerificationCode {
    @Id
    @GeneratedValue
    private Long id;
    @Column(nullable = false)
    private String code;
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime expiryAt;

    public VerificationCode() {}

    public VerificationCode(String code, User user) {
        this.code = code;
        this.user = user;
        this.expiryAt = LocalDateTime.now().plusMinutes(10); // hoặc thời gian bạn muốn
    }

//    public VerificationCode(VerificationCode code, User user) {
//    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getExpiryAt() {
        return expiryAt;
    }

    public void setExpiryAt(LocalDateTime expiryAt) {
        this.expiryAt = expiryAt;
    }
}

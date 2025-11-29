package com.example.onlineCourses.repository;

import com.example.onlineCourses.model.User;
import com.example.onlineCourses.model.VerificationCode;
import com.example.onlineCourses.model.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {
    Optional<VerificationCode> findByCode(String code);

    void deleteByUser(User user);

    Optional<Object> findByUser(User user);

    Optional<VerificationCode> findTopByUserOrderByCreatedAtDesc(User user);//Lấy mã mới nhất của user.

    Optional<VerificationCode> findByUserAndCode(User user, String code);
}

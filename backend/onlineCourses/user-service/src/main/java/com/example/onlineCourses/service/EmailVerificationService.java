package com.example.onlineCourses.service;

import com.example.onlineCourses.model.User;
import com.example.onlineCourses.model.VerificationCode;
import com.example.onlineCourses.repository.UserRepository;
import com.example.onlineCourses.repository.VerificationCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class EmailVerificationService {
    @Autowired
    private VerificationCodeRepository codeRepo;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(User user) {
        // Tạo mã OTP ngắn gọn (6 ký tự)
        String code = UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        // Lưu mã vào DB
        codeRepo.save(new VerificationCode(code, user));

        // Gửi email chứa mã
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(user.getEmail());
        mail.setSubject("Mã xác thực tài khoản");
        mail.setText("Mã xác thực của bạn là: " + code);
        mailSender.send(mail);
    }

    public boolean verifyCode(String email, String code) {
// Tìm user theo email
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));

        // Tìm mã xác thực khớp với user
        VerificationCode vc = codeRepo.findByUserAndCode(user, code)
                .orElseThrow(() -> new RuntimeException("Mã xác thực không hợp lệ"));

        // Kích hoạt tài khoản
        user.setEnabled(true);
        userRepo.save(user);

        // Xóa mã sau khi xác thực
        codeRepo.delete(vc);

        return true;

    }
}

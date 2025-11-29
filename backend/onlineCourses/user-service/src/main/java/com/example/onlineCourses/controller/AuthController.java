package com.example.onlineCourses.controller;

import com.example.onlineCourses.model.User;
import com.example.onlineCourses.repository.UserRepository;
import com.example.onlineCourses.service.EmailVerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepo;
    @Autowired
    private EmailVerificationService emailService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        user.setEnabled(false);
        userRepo.save(user);
        emailService.sendVerificationEmail(user);
        return ResponseEntity.ok("Đã gửi email xác thực");
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestParam String email, @RequestParam String code) {
        boolean result = emailService.verifyCode(email, code);
        return ResponseEntity.ok(result ? "Xác thực thành công" : "Xác thực thất bại");
    }
}

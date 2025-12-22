package com.example.onlineCourses.service;
import com.example.onlineCourses.DTO.UserDTO;
import com.example.onlineCourses.DTO.UserProfileDTO;
import com.example.onlineCourses.mapper.UserMapper;
import com.example.onlineCourses.model.User;
import com.example.onlineCourses.model.UserProfile;
import com.example.onlineCourses.model.VerificationCode;
import com.example.onlineCourses.model.VerificationCode;
import com.example.onlineCourses.repository.CartItemRepository;
import com.example.onlineCourses.repository.EnrollmentRepository;
import com.example.onlineCourses.repository.UserRepository;
import com.example.onlineCourses.repository.UserProfileRepository;
import com.example.onlineCourses.repository.VerificationCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private VerificationCodeRepository codeRepo;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private EnrollmentRepository enrollmentRepo;

    @Autowired
    private CartItemRepository cartItemRepo;

    @Autowired
    private UserProfileRepository userProfileRepo;


    public boolean emailExists(String email) {
        return userRepo.existsByEmail(email);
    }

//    @PreAuthorize("hasRole('USER')")4
    public User registerUser(User user) {
        // 1. Đánh dấu tài khoản chưa kích hoạt
        user.setEnabled(false);
        // 2. Lưu tài khoản vào database
        User savedUser = userRepo.save(user);

        // 3. Tạo token xác thực
        String otp = String.format("%06d", new Random().nextInt(999999));
        VerificationCode code = new VerificationCode(otp, user);
        codeRepo.save(code);

        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(user.getEmail());
        mail.setSubject("Mã xác thực tài khoản");
        mail.setText("Mã xác thực của bạn là: " + otp + "\nMã sẽ hết hạn sau 10 phút.");
        mailSender.send(mail);

        return savedUser;
    }


//    @PreAuthorize("hasRole('USER')")
    @Transactional
    //@PostMapping("/verify-otp")
    public boolean verifyOtp(@RequestParam String email, @RequestParam String code) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        VerificationCode vc = (VerificationCode) codeRepo.findTopByUserOrderByCreatedAtDesc(user)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã xác thực"));

        if (!vc.getCode().equals(code)) {
            return false;
        }

        if (vc.getExpiryAt().isBefore(LocalDateTime.now())) {
            codeRepo.delete(vc);
            throw new RuntimeException("Mã đã hết hạn");
        }

        user.setEnabled(true);
        userRepo.save(user);
        codeRepo.delete(vc);

        return true;
    }

    public List<UserDTO> getAllUsers() {
        return userRepo.findAll().stream().map(UserMapper::toDTO).toList();
    }

    public UserDTO getUserById(Long id) {
        User user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        return UserMapper.toDTO(user);
    }

    public void updateUser(Long id, UserDTO dto) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        user.setUsername(dto.getUsername());

        // Convert String -> Enum
        if (dto.getRole() != null) {
            user.setRole(User.Role.valueOf(dto.getRole().toUpperCase()));
        }

        userRepo.save(user);
    }


    //    public void deleteUser(Long id) {
//        userRepo.deleteById(id);
//    }
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        cartItemRepo.deleteByUserId(user.getId());

        // Xóa token nếu có
        codeRepo.deleteByUser(user);

        // Xóa các liên kết khác nếu cần
        enrollmentRepo.deleteByUser(user);

        userRepo.delete(user);
    }

    public User login(String email, String password) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));

        if (!user.isEnabled()) {
            throw new RuntimeException("Tài khoản chưa được xác thực qua email");
        }

        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Mật khẩu không đúng");
        }

        return user; // hoặc trả về thông tin người dùng nếu cần
    }

    public User findByEmail(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }


    public Long findIdByUsername(String username) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        return user.getId();
    }

    public UserProfileDTO getUserProfileById(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        UserProfile profile = userProfileRepo.findById(userId)
                .orElse(null);
        
        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setUsername(user.getUsername());
        dto.setRole(user.getRole() != null ? user.getRole().name() : null);
        
        if (profile != null) {
            dto.setPhone(profile.getPhone());
            dto.setAddress(profile.getAddress());
            dto.setDateOfBirth(profile.getDateOfBirth());
            dto.setBio(profile.getBio());
            dto.setAvatar(profile.getAvatar());
            dto.setSpecialization(profile.getSpecialization());
            dto.setEducation(profile.getEducation());
            dto.setExperience(profile.getExperience());
        }
        
        return dto;
    }

    @Transactional
    public UserProfileDTO updateUserProfile(Long userId, UserProfileDTO dto) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        // Update username if provided
        if (dto.getUsername() != null && !dto.getUsername().isEmpty()) {
            user.setUsername(dto.getUsername());
            userRepo.save(user);
        }
        
        // Get or create profile
        UserProfile profile = userProfileRepo.findById(userId).orElse(null);
        
        if (profile == null) {
            profile = new UserProfile(userId);
        }
        
        // Update profile fields
        if (dto.getPhone() != null) profile.setPhone(dto.getPhone());
        if (dto.getAddress() != null) profile.setAddress(dto.getAddress());
        if (dto.getDateOfBirth() != null) profile.setDateOfBirth(dto.getDateOfBirth());
        if (dto.getBio() != null) profile.setBio(dto.getBio());
        if (dto.getAvatar() != null) profile.setAvatar(dto.getAvatar());
        if (dto.getSpecialization() != null) profile.setSpecialization(dto.getSpecialization());
        if (dto.getEducation() != null) profile.setEducation(dto.getEducation());
        if (dto.getExperience() != null) profile.setExperience(dto.getExperience());
        
        userProfileRepo.save(profile);
        
        return getUserProfileById(userId);
    }
}
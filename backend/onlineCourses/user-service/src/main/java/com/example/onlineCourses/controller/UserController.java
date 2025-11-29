package com.example.onlineCourses.controller;

import com.example.onlineCourses.DTO.LoginRequestDTO;
import com.example.onlineCourses.DTO.UserDTO;
import com.example.onlineCourses.jwt.JwtService;
import com.example.onlineCourses.mapper.UserMapper;
import com.example.onlineCourses.model.User;
import com.example.onlineCourses.repository.UserRepository;
import com.example.onlineCourses.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private JwtService jwtService;

    // Đăng ký tài khoản
//    @PostMapping("/register")
//    public ResponseEntity<?> register(@RequestBody User user) {
//        if (userService.emailExists(user.getEmail())) {
//            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email đã tồn tại");
//        }
//        userService.registerUser(user);
//        return ResponseEntity.ok("Đăng ký thành công, vui lòng kiểm tra email để xác thực");
//    }
    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@RequestBody User user) {
        if (userService.emailExists(user.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        User savedUser = userService.registerUser(user);
        return ResponseEntity.ok(UserMapper.toDTO(savedUser));
    }


    // Xác thực email
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestParam String email, @RequestParam String code) {
        //boolean result = userService.verifyOtp(email, code);
        //return ResponseEntity.ok(result ? "Xác thực thành công" : "Xác thực thất bại");
        try {
            boolean result = userService.verifyOtp(email, code);
            if (result) {
                User user = userService.findByEmail(email);
                String token = jwtService.generateToken(user);
                UserDTO userDTO = UserMapper.toDTO(user);

                return ResponseEntity.ok(Map.of(
                        "token", token,
                        "user", userDTO
                ));
            } else {
                return ResponseEntity.badRequest().body("❌ Mã xác thực không đúng");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("❌ Lỗi xác thực: " + e.getMessage());
        }
    }

//    @PreAuthorize("hasRole('USER')")
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginDTO) {
        try {
            User user = userService.login(loginDTO.getEmail(), loginDTO.getPassword());

            String token = jwtService.generateToken(user); // sinh JWT token
            UserDTO userDTO = UserMapper.toDTO(user);

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "user", userDTO
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
    // Lấy tất cả người dùng
    @GetMapping
    public List<UserDTO> getAllUsers() {
        return userService.getAllUsers();
    }

    // Lấy người dùng theo ID
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // Cập nhật thông tin người dùng
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        userService.updateUser(id, userDTO);
        return ResponseEntity.ok("Cập nhật thành công");
    }

    // Xóa người dùng
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("Xóa thành công");
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<?> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

}


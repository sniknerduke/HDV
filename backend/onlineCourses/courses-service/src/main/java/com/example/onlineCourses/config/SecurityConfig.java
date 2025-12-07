package com.example.onlineCourses.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.example.onlineCourses.jwt.JwtAuthenticationFilter;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // thay cho @EnableGlobalMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter; // thêm dòng này
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                                // Public endpoints
                                .requestMatchers("/api/courses/id/{id}", "/api/courses/public/**", "/api/users/register", "/api/users/verify-otp", "/api/users/login").permitAll()
//                        .requestMatchers("/api/courses/public/**").permitAll()
//
//                        // User endpoints
//                        .requestMatchers("/api/courses/enroll/**").hasRole("USER")
//
//                        // Admin endpoints
//                        .requestMatchers("/api/courses/manage/**").hasRole("ADMIN")

//                        // Default
                        .anyRequest().authenticated()
                                // còn lại cho phép vào controller rồi @PreAuthorize xử lý
//                        .anyRequest().authenticated() //tạm bỏ
//                                .anyRequest().permitAll()

                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        return http.csrf(csrf -> csrf.disable())
////                .cors(cors -> {}) // bật CORS
//                .cors(Customizer.withDefaults())
//                .authorizeHttpRequests(auth -> auth
//                        // Cho phép Eureka client gọi tới server
//                        .requestMatchers("/eureka/**").permitAll()
//                        // Public endpoints
//                        .requestMatchers("/internal/**").permitAll()  // cho phép POST test
////                        .anyRequest().authenticated()
//                        .anyRequest().permitAll()
//                )
////                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
//                .build();
//    }
//                        .requestMatchers("/api/courses/public/**").permitAll()
//
//                        // User endpoints
//                        .requestMatchers("/api/courses/enroll/**").hasRole("USER")
//
//                        // Admin endpoints
//                        .requestMatchers("/api/courses/manage/**").hasRole("ADMIN")

//                        // Default
//                        .anyRequest().authenticated()
                        // còn lại cho phép vào controller rồi @PreAuthorize xử lý
//                        .anyRequest().authenticated() //tạm bỏ


//                );

//
//        return http.build();
//    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}


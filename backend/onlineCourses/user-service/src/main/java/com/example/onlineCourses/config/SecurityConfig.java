package com.example.onlineCourses.config;

import com.example.onlineCourses.jwt.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpMethod;

import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@EnableMethodSecurity(prePostEnabled = true) //jwt
@EnableWebSecurity
@Configuration
public class SecurityConfig {
//    @Autowired
//    private JwtAuthenticationFilter jwtFilter;
    @Autowired
    private HeaderAuthenticationFilter headerAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http,
                                                       PasswordEncoder encoder,
                                                       UserDetailsService uds) throws Exception {
        AuthenticationManagerBuilder authBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        authBuilder.userDetailsService(uds).passwordEncoder(encoder);
        return authBuilder.build();
    }
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.disable())
                // đặt filter trước cả AnonymousAuthenticationFilter
//                .addFilterBefore(headerAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
//                .addFilterBefore(headerAuthenticationFilter, org.springframework.security.web.authentication.AnonymousAuthenticationFilter.class)
//                .addFilterBefore(headerAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(headerAuthenticationFilter, AnonymousAuthenticationFilter.class)

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/payment/callback/vnpay",
                                "/api/users/register",
                                "/api/users/login",
                                "/api/users/verify-otp",
                                "/api/orders/update-status",
                                "/api/orders/update-status/**",
                                "/error"
                        )
                        .permitAll()
//                        .requestMatchers(HttpMethod.POST, "/api/orders/update-status**").permitAll()

                        .anyRequest().authenticated()
                );
        return http.build();
    }


//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//        http
//                .csrf(csrf -> csrf.disable())
//                .cors(cors -> cors.disable())  // ⛔ TẮT CORS Ở SERVICE
//                .addFilterBefore(headerAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
//                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers("/payment/callback/vnpay",
//                                "/api/users/register",
//                                "/api/users/login",
//                                "/api/users/verify-otp",
////                                "/**/update-status",
//                                "/api/orders/update-status")
//                        .permitAll()
//                        .anyRequest().authenticated()   // 🔥 BẮT BUỘC
////                        .anyRequest().permitAll()
//                );
//        return http.build();
//    }

    // SecurityFilterChain: cấu hình bảo mật cho API
    //đang lấy role từ userDetailService
//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//        http
//                .csrf(csrf -> csrf.disable())
//                .cors(cors -> cors.configurationSource(request -> {
//                    var corsConfig = new org.springframework.web.cors.CorsConfiguration();
//                    corsConfig.setAllowedOrigins(java.util.List.of("http://localhost:3000"));
//                    corsConfig.setAllowedMethods(java.util.List.of("GET","POST","PUT","DELETE","OPTIONS"));
//                    corsConfig.setAllowedHeaders(java.util.List.of("*"));
//                    corsConfig.setAllowCredentials(true);
//                    corsConfig.addExposedHeader("Authorization");
//                    return corsConfig;
//                }))
//                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers( "/payment/callback/vnpay","/api/users/register", "/api/users/login", "/api/users/verify-otp").permitAll()
////                        .anyRequest().authenticated()
//                                .anyRequest().permitAll()
//                );
////                .addFilterBefore(jwtFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);
//
//        return http.build();
//    }


//    @Bean
//    public AuthenticationManager authManager(HttpSecurity http, PasswordEncoder encoder, UserDetailsService uds)
//            throws Exception {
//        return http.getSharedObject(AuthenticationManagerBuilder.class)
//                .userDetailsService(uds)
//                .passwordEncoder(encoder)
//                .and()
//                .build();
//    }
//
//    }


//
//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder();
//    }
}
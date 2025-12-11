package com.example.onlineCourses.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

@Configuration
public class FeignConfig {
    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                // Forward Authorization header
                String authHeader = request.getHeader("Authorization");
                if (authHeader != null) {
                    requestTemplate.header("Authorization", authHeader);
                }
                // Forward custom headers
                String userId = request.getHeader("X-User-Id");
                String roles = request.getHeader("X-User-Roles");
                if (userId != null) {
                    requestTemplate.header("X-User-Id", userId);
                }
                if (roles != null) {
                    requestTemplate.header("X-User-Roles", roles);
                }
            }
        };
    }
}


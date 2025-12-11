package com.example.onlineCourses.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.List;

@Slf4j
@Component
public class HeaderAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String header = headerNames.nextElement();
            log.info("HEADER = " + header + " : " + request.getHeader(header));
        }

        String path = request.getRequestURI();
//         Bỏ qua filter cho update-status
        if (path.contains("/api/orders/update-status")) {
            filterChain.doFilter(request, response);
            return;
        }
        log.info(">>> TOKEN = " + request.getHeader("Tên-header-token"));

//        if (path.startsWith("/api/orders/update-status")) {
//            filterChain.doFilter(request, response);
//            return;
//        }


        String userId = request.getHeader("X-User-Id");
        String rolesHeader = request.getHeader("X-User-Roles");

        if (userId != null && rolesHeader != null) {

            List<SimpleGrantedAuthority> authorities = Arrays.stream(rolesHeader.split(","))
                    .map(SimpleGrantedAuthority::new)
                    .toList();

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                            userId,
                            null,
                            authorities
                    );

            SecurityContextHolder.getContext().setAuthentication(auth);

            log.info("Authentication SUCCESS - Authorities = {}", authorities);
            log.warn(">>> REQUEST PATH = {}", request.getRequestURI());
            log.info(">>> TOKEN = " + request.getHeader("Tên-header-token"));


        }

        filterChain.doFilter(request, response);
    }
}

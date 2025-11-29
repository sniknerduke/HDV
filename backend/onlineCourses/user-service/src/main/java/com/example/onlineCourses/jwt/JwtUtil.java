package com.example.onlineCourses.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtil {

    private final String SECRET_KEY = "THIS_IS_MY_SECRET_KEY_256_BITS_LONG_ABCXYZ1234567890";

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    // ===========================
    // 1. Validate Token
    // ===========================
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            System.out.println("❌ Token expired");
        } catch (JwtException e) {
            System.out.println("❌ Invalid token");
        }
        return false;
    }

    // ===========================
    // 2. Get Username (subject)
    // ===========================
    public String getUsername(String token) {
        Claims claims = extractClaims(token);
        return claims.getSubject(); // sub
    }

    // ===========================
    // 3. Get Roles: trả về List<String>
    // ex: ["ROLE_USER", "ROLE_ADMIN"]
    // ===========================
    public List<String> getRoles(String token) {
        Claims claims = extractClaims(token);

        return (List<String>) claims.get("roles");
    }

    // ===========================
    // Helpers
    // ===========================
    private Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ===========================
    // 4. Generate Token (nếu cần)
    // ===========================
    public String generateToken(String username, List<String> roles) {
        long expirationMs = 1000 * 60 * 60; // 1h

        return Jwts.builder()
                .setSubject(username)
                .claim("roles", roles)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
}


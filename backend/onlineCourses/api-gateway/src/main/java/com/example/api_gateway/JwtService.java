package com.example.api_gateway;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class JwtService {
    private final String SECRET_KEY = "mysuperlongsecretkeythatismorethan32characterslong"; // orthay bằng private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);

//    public String generateToken(User user) {
//        Map<String, Object> claims = new HashMap<>();
//        claims.put("roles", List.of(user.getRole().name())); // hoặc ROLE_USER
//        claims.put("id", user.getId()); // thêm userId vào claims
//
//        return Jwts.builder()
//                .setClaims(claims)
//                .setSubject(user.getUsername()) // subject là username
//                .setIssuedAt(new Date(System.currentTimeMillis()))
//                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 1h
//                .signWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()), SignatureAlgorithm.HS256)
//                .compact();
//    }

//    public String generateToken(UserDetails userDetails, Long userId) {
////        Map<String, Object> claims = new HashMap<>();
////        claims.put("roles", userDetails.getAuthorities()
////                .stream()
////                .map(GrantedAuthority::getAuthority) // sẽ là ROLE_USER
////                .collect(Collectors.toList()));
//        Map<String, Object> claims = new HashMap<>();
//        // Lấy authorities từ UserDetails (ví dụ ROLE_USER)
//        claims.put("roles", userDetails.getAuthorities()
//                .stream()
//                .map(GrantedAuthority::getAuthority) // sẽ là ROLE_USER, ROLE_ADMIN...
//                .collect(Collectors.toList()));
//        claims.put("id", userId); // thêm userId vào claims
//
//        return Jwts.builder()
//                .setClaims(claims) // thêm claims vào token
//                .setSubject(userDetails.getUsername())
//                .setIssuedAt(new Date(System.currentTimeMillis()))
//                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 1h
//                .signWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()), SignatureAlgorithm.HS256)
//                .compact();
//    }

    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()))
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public Long extractUserId(String token) {
        var claims = Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()))
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.get("id", Long.class);
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        Date expiration = Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()))
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getExpiration();
        return expiration.before(new Date());
    }

    public List<GrantedAuthority> extractRoles(String token) {
        var claims = Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()))
                .build()
                .parseClaimsJws(token)
                .getBody();

        List<String> roles = claims.get("roles", List.class);

        return roles.stream()
                .map(SimpleGrantedAuthority::new) // ví dụ "ROLE_USER"
                .collect(Collectors.toList());
    }
}


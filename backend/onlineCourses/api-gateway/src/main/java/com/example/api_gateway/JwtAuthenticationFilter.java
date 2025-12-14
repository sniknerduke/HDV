package com.example.api_gateway;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.stream.Collectors;


@Component
@Order(-1)
public class JwtAuthenticationFilter implements GlobalFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        // BỎ QUA NGAY TỪ ĐẦU NẾU LÀ PRELIGHT REQUEST
        if (request.getMethod() == HttpMethod.OPTIONS) {
            exchange.getResponse().setStatusCode(HttpStatus.OK);
            return exchange.getResponse().setComplete();
        }
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);



        String path = request.getURI().getPath();

// Bỏ qua preflight + public endpoints
        if (request.getMethod() == HttpMethod.OPTIONS ||
                path.contains("login") ||
                path.contains("register") ||
                path.contains("/vnpay/return") ||
                path.contains("/api/orders/update-status") ||
                path.contains("/api/courses/public/list") ||
                path.contains("/api/statistics") // <--- THÊM MỚI Ở ĐÂY
        ) {
            return chain.filter(exchange);
        }


        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(7);
        try {
            String username = jwtService.extractUsername(token);
            Long userId = jwtService.extractUserId(token); // lấy id từ claim "id"
            List<GrantedAuthority> roles = jwtService.extractRoles(token);

            // Gắn thông tin user vào header để service nội bộ đọc
            ServerHttpRequest mutatedRequest = request.mutate()
                    .header("X-User-Id", String.valueOf(userId))
                    .header("X-User-Roles", roles.stream()
//                            .map(r -> "ROLE_" + r)
                            .map(GrantedAuthority::getAuthority)
                            .collect(Collectors.joining(",")))
                    .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        } catch (Exception e) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }
}

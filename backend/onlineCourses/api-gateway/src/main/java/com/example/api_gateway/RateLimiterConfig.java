package com.example.api_gateway;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

@Configuration
public class RateLimiterConfig {

//    @Bean
//    public KeyResolver userKeyResolver() {
//        return exchange -> Mono.just(
//                exchange.getRequest().getHeaders().getFirst("X-User-Id")
//        );
//    }
//    @Bean
//    public KeyResolver ipKeyResolver() {
//        return exchange -> Mono.just(exchange.getRequest().getRemoteAddress().getAddress().getHostAddress());
//    }

    @Bean
    public KeyResolver userKeyResolver() {
        return exchange -> {
            String userId = exchange.getRequest().getHeaders().getFirst("X-User-Id");
            System.out.println("RateLimit key: " + userId);
            return Mono.just(userId != null ? userId : "anonymous");
        };
    }



//    @Bean
//    public KeyResolver ipKeyResolver() {
//        return exchange -> {
//            String ip = exchange.getRequest().getRemoteAddress() != null
//                    ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
//                    : "unknown";
//            System.out.println("RateLimit key: " + ip);
//            return Mono.just(ip);
//        };
//    }



}


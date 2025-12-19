package com.example.onlineCourses.repository;

import com.example.onlineCourses.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderId(String orderId);
    Optional<Order> findById(Long Id);
    List<Order> findByStatusOrderByCreatedAtDesc(String status);
    List<Order> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);
    List<Order> findByStatusAndCreatedAtBetweenOrderByCreatedAtDesc(String status, LocalDateTime start, LocalDateTime end);
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
}
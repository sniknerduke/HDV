package com.example.onlineCourses.repository;

import com.example.onlineCourses.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);
//    List<OrderItem> findBy_OrderId(String orderId);

}



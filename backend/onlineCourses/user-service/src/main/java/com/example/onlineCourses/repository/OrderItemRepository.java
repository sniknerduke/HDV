package com.example.onlineCourses.repository;

import com.example.onlineCourses.DTO.SalesSummaryDTO;
import com.example.onlineCourses.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);
//    List<OrderItem> findBy_OrderId(String orderId);
    // dừng để thống kê
    @Query("SELECT new com.example.onlineCourses.DTO.SalesSummaryDTO(oi.courseId, oi.courseName, COUNT(oi.id), SUM(oi.price)) " +
            "FROM OrderItem oi JOIN oi.order o " +
            "WHERE o.status = 'SUCCESS' " +
            "AND o.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY oi.courseId, oi.courseName")
    List<SalesSummaryDTO> findSalesStatistics(@Param("startDate") LocalDateTime startDate,
                                              @Param("endDate") LocalDateTime endDate);
    // hết
}



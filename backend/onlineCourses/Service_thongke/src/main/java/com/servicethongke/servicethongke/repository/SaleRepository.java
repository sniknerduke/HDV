package com.servicethongke.servicethongke.repository;

import com.servicethongke.servicethongke.entity.Sale;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {
    /**
     * Thống kê tổng lượt bán và doanh thu theo khóa học
     * trong khoảng thời gian start -> end.
     */
    @Query("""
        SELECT s.course.id as courseId,
               s.course.code as code,
               s.course.title as title,
               SUM(s.quantity) as totalSold,
               SUM(s.price * s.quantity) as totalRevenue
        FROM Sale s
        WHERE s.status = 'COMPLETED'
          AND s.createdAt BETWEEN :start AND :end
        GROUP BY s.course.id, s.course.code, s.course.title
        ORDER BY SUM(s.quantity) DESC
        """)
    List<CourseSalesProjection> findSalesByCourseBetween(
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);
}

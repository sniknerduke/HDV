package com.servicethongke.servicethongke.repository;

import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

public interface CourseSalesProjection {
    Long getCourseId();        // id khóa
    String getCode();          // mã khóa (nếu select)
    String getTitle();         // tên khóa
    Long getTotalSold();       // SUM(quantity)
    BigDecimal getTotalRevenue(); // SUM(price * quantity) hoặc null nếu không cần
}

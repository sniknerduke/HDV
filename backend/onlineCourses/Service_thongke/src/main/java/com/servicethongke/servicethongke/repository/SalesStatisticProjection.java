package com.servicethongke.servicethongke.repository;

import lombok.Getter;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;


public interface SalesStatisticProjection {
    Long getCourseId();//ID khóa học.
    String getCourseCode();//Mã khóa học (ví dụ JAVA-101). Optional nhưng hữu ích.
    String getCourseTitle();//Tên khóa học để hiển thị.
    BigDecimal getTotalRevenue();//Tổng doanh thu (SUM(price * quantity)), optional.
}

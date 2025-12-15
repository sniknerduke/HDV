package com.servicethongke.servicethongke.dto.reponse;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SaleResponse {
    private Long id;
    private String courseTitle; // Trả về tên khóa học cho dễ nhìn
    private String courseCode;
    private Integer quantity;
    private BigDecimal price;
    private String status;
    private LocalDate createdAt;
}

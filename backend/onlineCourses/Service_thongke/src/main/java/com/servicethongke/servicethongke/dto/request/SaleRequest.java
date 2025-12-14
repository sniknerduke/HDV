package com.servicethongke.servicethongke.dto.request;




import jakarta.validation.constraints.NotNull;
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
public class SaleRequest {
    @NotNull(message = "Course ID không được để trống")
    private Long courseId;

    private Integer quantity = 1; // Mặc định là 1

    private BigDecimal price;

    private String status; // COMPLETED, PENDING...

    // Cho phép nhập ngày tạo để fake dữ liệu quá khứ
    private LocalDate createdAt;
}

package com.servicethongke.servicethongke.dto.reponse;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * CourseSalesResponse
 *
 * DTO trả về cho client 1 dòng kết quả:
 *  - courseId: id của khóa (Long)
 *  - code: mã khóa (ví dụ "JAVA-101") — optional nhưng hữu dụng để hiển thị
 *  - title: tên khóa
 *  - totalSold: tổng số lượt bán trong khoảng thời gian (SUM(quantity))
 *  - totalRevenue: tổng doanh thu (SUM(price * quantity)) — optional, có thể null nếu bạn không tính doanh thu
 *
 * Lưu ý:
 *  - totalSold dùng Long để an toàn với số lượng lớn.
 *  - totalRevenue dùng BigDecimal cho tiền.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CourseSalesResponse {
    private Long courseId;
    private String code;
    private String title;
    private Long totalSold;
    private BigDecimal totalRevenue; // có thể là null nếu không cần doanh thu

}

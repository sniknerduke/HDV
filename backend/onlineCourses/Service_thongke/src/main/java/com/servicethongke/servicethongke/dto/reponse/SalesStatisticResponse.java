package com.servicethongke.servicethongke.dto.reponse;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
// DTO trả về kết quả thống kê lượt bán
public class SalesStatisticResponse {

    // ID của khóa học (khớp với user-service)
    private Long courseId;

    // Tên khóa học (Mình đổi từ courseTitle -> courseName để khớp với dữ liệu bên đơn hàng)
    private String courseName;

    // Mã khóa học: Bên User-service không có thông tin này nên tạm thời mình bỏ qua
    // để tránh lỗi null hoặc phải gọi API phức tạp.
    // private String courseCode;

    // Tổng số lượng bán (COUNT)
    private Long totalSold;

    // Tổng doanh thu (SUM).
    // Lưu ý: Đổi sang Long vì bên User-service lưu giá là 'long', không phải 'BigDecimal'
    private Long totalRevenue;
}
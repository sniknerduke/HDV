package com.servicethongke.servicethongke.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
/**
 * Entity: Sale
 * Mô tả: mỗi bản ghi đại diện cho 1 lượt bán / 1 item bán cho 1 khóa tại 1 thời điểm.
 *
 * Thiết kế hướng tới:
 * - Thống kê số lượt bán theo khóa trong khoảng thời gian (theo createdAt).
 * - Lưu đủ thông tin để có thể mở rộng thống kê (ví dụ doanh thu).
 *
 * Quy ước lưu thời gian:
 * - Mình khuyến nghị dùng Instant (lưu UTC) hoặc LocalDateTime kèm timezone xử lý.
 * - Ở ví dụ dưới dùng LocalDateTime để dễ parse, nhưng bạn có thể chuyển thành Instant nếu muốn chuẩn UTC.
 */
@Entity
@Table(name = "sales",
        indexes = {
                @Index(name = "idx_sales_created_at", columnList = "created_at"),
                @Index(name = "idx_sales_course_created", columnList = "course_id, created_at")
        })
@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * course: liên kết tới Course
     * - ManyToOne: nhiều sale có thể thuộc cùng 1 khóa.
     * - FetchType.LAZY để tránh join không cần thiết khi load sale.
     * - JoinColumn nullable = false: mỗi sale phải liên kết với 1 course.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_sale_course"))
    private Course course;
    /**
     * quantity: số lượng (lượt) bán trong bản ghi này.
     * - thường 1 (một order mua 1 khóa), nhưng nếu order cho phép mua nhiều cùng lúc (ví dụ tặng/gói) thì có >1.
     * - Khóa này dùng Long/Integer tùy nhu cầu; Integer đủ cho hầu hết.
     * - default = 1, không-null.
     */    @Column(nullable = false)
    private Integer quantity = 1;

    /**
     * price: giá của 1 đơn vị tại thời điểm bán (cần cho thống kê doanh thu).
     * - BigDecimal dùng cho tiền để tránh lỗi làm tròn của float/double.
     * - precision/scale: precision tổng số chữ số, scale số chữ số sau dấu thập phân.
     *   Ví dụ precision=12, scale=2 cho phép tới 9999999999.99
     * - Có thể để nullable nếu bạn không lưu giá ở đây.
     */
    @Column(nullable = true, precision = 12, scale = 2)
    private BigDecimal price;
    /**
     * createdAt: thời điểm tạo bản ghi bán (rất quan trọng để lọc theo thời gian).
     * - Loại: LocalDateTime (không kèm timezone) hoặc Instant (UTC).
     * - Nếu dùng LocalDateTime: cần thống nhất timezone server / database khi so sánh.
     * - Rất khuyến nghị set giá trị này tự động bằng @PrePersist.
     */
    @Column(name = "created_at", nullable = false)
    private LocalDate createdAt;
    /**
     * status: trạng thái giao dịch.
     * - Ví dụ: "COMPLETED", "PENDING", "CANCELLED".
     * - Khi thống kê lượt bán "thực tế", ta thường filter status = COMPLETED để loại các giao dịch hủy hoặc chưa thanh toán.
     * - Có thể dùng Enum type an toàn hơn (see SaleStatus enum).
     */
    @Column(length = 20)
    private String status; // "COMPLETED", "CANCELLED", ...
    // -------- lifecycle callback để set createdAt tự động --------
    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDate.now(); // hoặc Instant.now() nếu dùng Instant
        }
    }
}

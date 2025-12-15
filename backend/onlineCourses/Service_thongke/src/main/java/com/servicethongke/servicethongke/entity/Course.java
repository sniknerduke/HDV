package com.servicethongke.servicethongke.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "courses")
@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Course {
    /**
     * id: khóa chính (PK), tự tăng.
     * - Long phù hợp cho đại đa số ứng dụng (lượng records lớn vẫn ok).
     * - GenerationType.IDENTITY tương thích MySQL AUTO_INCREMENT.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * code: mã khóa (ví dụ "JAVA-101").
     * - Có lợi khi bạn muốn hiển thị/tra cứu khóa bằng mã thay vì id.
     * - Đánh dấu unique để tránh trùng mã.
     * - Đặt nullable = false nếu muốn mã luôn có (ở đây mình đặt không null để khuyến nghị).
     * - Nếu bạn không dùng mã thì có thể bỏ hoặc để optional.
     */
    @Column(nullable = false, unique = true)
    private String code; // optional

    /**
     * title: tên khóa học.
     * - Đặt nullable = false vì tên là cần thiết để hiển thị.
     * - length có thể điều chỉnh theo yêu cầu (80 là hợp lý cho tiêu đề ngắn).
     */
    @Column(nullable = false)
    private String title;

}

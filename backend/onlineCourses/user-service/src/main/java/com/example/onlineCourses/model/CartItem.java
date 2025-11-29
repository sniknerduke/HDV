package com.example.onlineCourses.model;

import com.example.onlineCourses.DTO.CourseDTO;
import jakarta.persistence.*;

@Entity
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

//    @ManyToOne
    @Column(name = "user_id", nullable = false) //xóa user theo id
//    private User user;
    private Long userId;

    // chỉ lưu courseId, không lưu CourseDTO
    @Column(name = "course_id", nullable = false)
    private Long courseId;

//    private int quantity = 1;

//    @Column(nullable = false)
//    private Long price;
//
//    public long getPrice() {
//        return price;
//    }

//    public void setPrice(Long price) {
//        this.price = price;
//    }
//    public long getPrice() {
//        // không thể lấy trực tiếp từ entity, sẽ lấy qua service khi cần
//        return 0L;
//    }

    // Constructors
    public CartItem() {}

//    public CartItem(Long userId, Long courseId) {
//        this.userId = userId;
//        this.courseId = courseId;
//        this.quantity = 1;
//    }

    // Getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

//    public int getQuantity() {
//        return quantity;
//    }
//
//    public void setQuantity(int quantity) {
//        this.quantity = quantity;
//    }


}

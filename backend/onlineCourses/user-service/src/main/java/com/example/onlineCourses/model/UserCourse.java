package com.example.onlineCourses.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_course")
public class UserCourse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "order_id", nullable = false)
    private String orderId; // foreign key tới Order.orderId

    @Column(name = "user_id", nullable = false)// ví dụ ORD-20251115-001
    private Long userId;
    @Column(name = "course_id", nullable = false)
    private Long courseId;
//    user_id, course_id, order_id, status=active
    @Column(name = "status", nullable = false)
    private String status;

    public UserCourse() {
    }

    public UserCourse(Long id, String status) {
        this.id = id;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

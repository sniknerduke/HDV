package com.example.onlineCourses.DTO;

public class UserCourseDto {
    private Long userId;
    private Long courseId;
    private String orderId;
    private String status;

    public UserCourseDto(Long userId, Long courseId, String orderId, String status) {
        this.userId = userId;
        this.courseId = courseId;
        this.orderId = orderId;
        this.status = status;
    }

    public UserCourseDto(Long userId, Long courseId, String status) {
        this.userId = userId;
        this.courseId = courseId;
        this.status = status;
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

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}


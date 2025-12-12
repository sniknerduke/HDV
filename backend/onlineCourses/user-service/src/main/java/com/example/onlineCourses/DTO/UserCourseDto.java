package com.example.onlineCourses.DTO;

public class UserCourseDto {
    private Long userId;
    private Long courseId;
    private Long orderId;
    private String status;

    public UserCourseDto(Long userId, Long courseId, Long orderId, String status) {
        this.userId = userId;
        this.courseId = courseId;
        this.orderId = orderId;
        this.status = status;
    }

    // getters & setters
}


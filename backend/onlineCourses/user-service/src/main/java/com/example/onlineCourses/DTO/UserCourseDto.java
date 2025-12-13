package com.example.onlineCourses.DTO;

public class UserCourseDto {
    private Long userId;
    private Long courseId;
    private String orderId;
    private String status;
//
//    public UserCourseDto() {
//    }
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

    // getters & setters
}


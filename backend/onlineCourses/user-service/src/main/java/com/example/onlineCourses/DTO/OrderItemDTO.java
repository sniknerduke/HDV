package com.example.onlineCourses.DTO;

public class OrderItemDTO {
    private Long id;
    private Long orderId;
    private Long courseId;
    private String courseName;
    private long price;

    public OrderItemDTO(Long id, Long orderId, Long courseId,String courseName, long price) {
        this.id = id;
        this.orderId = orderId;
        this.courseId = courseId;
        this.courseName = courseName;
        this.price = price;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public long getPrice() {
        return price;
    }

    public void setPrice(long price) {
        this.price = price;
    }

    public String getCourseTitle() {
        return courseName;
    }

    public void setCourseTitle(String courseName) {
        this.courseName = courseName;
    }
    // Getter & Setter
}


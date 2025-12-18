package com.example.onlineCourses.DTO;

public class OrderItemDTO {
    private Long id;
    private Long orderId;
    private Long courseId;
    private String courseTitle;
    private long price;

    public OrderItemDTO(Long id, Long orderId, Long courseId,String courseTitle, long price) {
        this.id = id;
        this.orderId = orderId;
        this.courseId = courseId;
        this.courseTitle = courseTitle;
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
        return courseTitle;
    }

    public void setCourseTitle(String courseTitle) {
        this.courseTitle = courseTitle;
    }
    // Getter & Setter
}


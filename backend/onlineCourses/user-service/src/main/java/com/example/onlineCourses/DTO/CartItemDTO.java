package com.example.onlineCourses.DTO;

public record CartItemDTO(
        Long cartItemId,
        Long courseId,
//        int quantity,
        String courseTitle,
        long coursePrice
//        String thumbnail
) {}
//public class CartItemDTO {
//    private Long id;
//    private int quantity;
//    private Long courseId;
//    private Long price;
//    private CourseDTO course;
//
//    public Long getCourseId() {
//        return courseId;
//    }
//
//    public void setCourseId(Long courseId) {
//        this.courseId = courseId;
//    }
//
//    public Long getPrice() {
//        return price;
//    }
//
//    public void setPrice(Long price) {
//        this.price = price;
//    }
//
//    public Long getId() {
//        return id;
//    }
//
//    public void setId(Long id) {
//        this.id = id;
//    }
//
//    public int getQuantity() {
//        return quantity;
//    }
//
//    public void setQuantity(int quantity) {
//        this.quantity = quantity;
//    }
//
//    public CourseDTO getCourse() {
//        return course;
//    }
//
//    public void setCourse(CourseDTO course) {
//        this.course = course;
//    }
//}

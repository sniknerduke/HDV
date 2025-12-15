package com.example.onlineCourses.DTO;

public class SalesSummaryDTO {
    private Long courseId;
    private String courseName;
    private Long totalSold;     // Tổng số lượng bán
    private Long totalRevenue;  // Tổng doanh thu

    public SalesSummaryDTO(Long courseId, String courseName, Long totalSold, Long totalRevenue) {
        this.courseId = courseId;
        this.courseName = courseName;
        this.totalSold = totalSold;
        this.totalRevenue = totalRevenue;
    }

    // Getter & Setter
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }
    public Long getTotalSold() { return totalSold; }
    public void setTotalSold(Long totalSold) { this.totalSold = totalSold; }
    public Long getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Long totalRevenue) { this.totalRevenue = totalRevenue; }
}
package com.example.onlineCourses.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Entity
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    @NotBlank(message = "Mã khóa học không được để trống")
    private String code;

    @NotBlank(message = "Tên khóa học không được để trống")
    private String title;

    @Positive(message = "Giá tiền phải lớn hơn 0")
    private long price;

    @Positive(message = "Thời lượng phải lớn hơn 0")
    private int duration; // số giờ hoặc số ngày

//    @NotNull(message = "Ngày bắt đầu không được để trống")
//    private LocalDate startDate;
//
//    @NotNull(message = "Ngày kết thúc không được để trống")
//    private LocalDate endDate;

    private String description;

    /** Người tạo / giáo viên sở hữu khóa học. Dùng để lọc danh sách theo giáo viên. */
    private String createdBy;

    public Course() {}

//    // Getters and setters
//    @ManyToOne
//    @JoinColumn(name = "provider_id")
//    private Provider provider;

//    public Provider getProvider() {
//        return provider;
//    }
//
//    public void setProvider(Provider provider) {
//        this.provider = provider;
//    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public long getPrice() {
        return price;
    }

    public void setPrice(long price) {
        this.price = price;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

//    public LocalDate getStartDate() {
//        return startDate;
//    }
//
//    public void setStartDate(LocalDate startDate) {
//        this.startDate = startDate;
//    }
//
//    public void setDuration(int duration) {
//        this.duration = duration;
//    }
//
//    public LocalDate getEndDate() {
//        return endDate;
//    }
//
//    public void setEndDate(LocalDate endDate) {
//        this.endDate = endDate;
//    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
}

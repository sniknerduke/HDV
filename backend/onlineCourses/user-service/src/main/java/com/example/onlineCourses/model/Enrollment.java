package com.example.onlineCourses.model;

import com.example.onlineCourses.DTO.CourseDTO;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

//    @ManyToOne
//    private CourseDTO course;

    private LocalDate enrollmentDate;

    // Constructors
    public Enrollment() {}

    public Enrollment(User user, CourseDTO course, LocalDate enrollmentDate) {
        this.user = user;
//        this.course = course;
        this.enrollmentDate = enrollmentDate;
    }

    // Getters and setters
    public Long getId() { return id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

//    public CourseDTO getCourse() { return course; }
//    public void setCourse(CourseDTO course) { this.course = course; }

    public LocalDate getEnrollmentDate() { return enrollmentDate; }
    public void setEnrollmentDate(LocalDate enrollmentDate) { this.enrollmentDate = enrollmentDate; }
}

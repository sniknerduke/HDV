package com.servicethongke.servicethongke.controller;

import com.servicethongke.servicethongke.dto.reponse.CourseResponse;
import com.servicethongke.servicethongke.dto.request.CourseRequest;
import com.servicethongke.servicethongke.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {
    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    // 1. API Thêm khóa học (POST)
    @PostMapping
    public ResponseEntity<CourseResponse> createCourse(@RequestBody @Valid CourseRequest request) {
        return ResponseEntity.ok(courseService.createCourse(request));
    }

    // 2. API Lấy tất cả khóa học (GET)
    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    // 3. API Sửa khóa học (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<CourseResponse> updateCourse(@PathVariable Long id, @RequestBody @Valid CourseRequest request) {
        return ResponseEntity.ok(courseService.updateCourse(id, request));
    }

    // 4. API Xóa khóa học (DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok("Xóa thành công khóa học ID: " + id);
    }
}

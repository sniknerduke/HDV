package com.servicethongke.servicethongke.service;

import com.servicethongke.servicethongke.dto.reponse.CourseResponse;
import com.servicethongke.servicethongke.dto.request.CourseRequest;
import com.servicethongke.servicethongke.entity.Course;
import com.servicethongke.servicethongke.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseService {
    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    // 1. Tạo mới khóa học
    public CourseResponse createCourse(CourseRequest request) {
        Course course = new Course();
        course.setCode(request.getCode());
        course.setTitle(request.getTitle());

        Course savedCourse = courseRepository.save(course);
        return new CourseResponse(savedCourse.getId(), savedCourse.getCode(), savedCourse.getTitle());
    }

    // 2. Lấy danh sách tất cả khóa học
    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(c -> new CourseResponse(c.getId(), c.getCode(), c.getTitle()))
                .collect(Collectors.toList());
    }

    // 3. Sửa khóa học
    public CourseResponse updateCourse(Long id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học với ID: " + id));

        course.setCode(request.getCode());
        course.setTitle(request.getTitle());

        Course updatedCourse = courseRepository.save(course);
        return new CourseResponse(updatedCourse.getId(), updatedCourse.getCode(), updatedCourse.getTitle());
    }

    // 4. Xóa khóa học
    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy khóa học với ID: " + id);
        }
        courseRepository.deleteById(id);
    }
}

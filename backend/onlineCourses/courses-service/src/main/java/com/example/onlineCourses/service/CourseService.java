package com.example.onlineCourses.service;

import com.example.onlineCourses.model.Course;
import com.example.onlineCourses.model.Provider;
import com.example.onlineCourses.repository.CourseRepository;
import com.example.onlineCourses.repository.ProviderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.client.RestTemplate;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepo;

    @Autowired
    private ProviderRepository providerRepo;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String LESSON_SERVICE_BASE = "http://localhost:8083";

    private String getCurrentAuthHeader() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs != null) {
            HttpServletRequest request = attrs.getRequest();
            return request.getHeader("Authorization");
        }
        return null;
    }

    public Course createCourse(Course course, String createdBy) {
        course.setCreatedBy(createdBy);
        return courseRepo.save(course);
    }

//    public Course createCourse(Long providerId, Course course) {
//        Provider provider = providerRepo.findById(providerId)
//                .orElseThrow(() -> new RuntimeException("Provider not found"));
//        course.setProvider(provider);
//        return courseRepo.save(course);
//    }

//    public List<Course> getCoursesByProvider(Long providerId) {
//        Provider provider = providerRepo.findById(providerId)
//                .orElseThrow(() -> new RuntimeException("Provider not found"));
//        return courseRepo.findByProvider(provider);
//    }

    public List<Course> getAllCourses() {
        return courseRepo.findAll();
    }

    public List<Course> getCoursesByOwner(String createdBy) {
        if (createdBy == null || createdBy.isBlank()) {
            return List.of();
        }
        return courseRepo.findByCreatedBy(createdBy);
    }

    public Course getByCode(String code) {
        return courseRepo.findByCode(code);
    }

    public Course getById(Long id) {
        return courseRepo.findById(id).orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
    }
    public List<Course> getCoursesByIds(List<Long> ids) {
        return courseRepo.findAllById(ids);
    }

    public void deleteCourse(Long id) {
        if (!courseRepo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found with id: " + id);
        }

        // Cascade delete lessons/sections in lesson-service with forwarded JWT
        try {
            String authHeader = getCurrentAuthHeader();
            HttpHeaders headers = new HttpHeaders();
            if (authHeader != null) {
                headers.set("Authorization", authHeader);
            }
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            restTemplate.exchange(
                LESSON_SERVICE_BASE + "/api/lessons/course/" + id,
                HttpMethod.DELETE,
                entity,
                Void.class
            );
        } catch (Exception ex) {
            // Log and proceed with course deletion to avoid blocking
            System.err.println("Failed to purge lessons for course " + id + ": " + ex.getMessage());
        }

        courseRepo.deleteById(id);
    }

    public Course updateCourse(Long id, Course payload) {
        Course existing = courseRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found with id: " + id));

        if (!StringUtils.hasText(payload.getCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã khóa học không được để trống");
        }
        if (!StringUtils.hasText(payload.getTitle())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên khóa học không được để trống");
        }
        if (payload.getPrice() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giá khóa học phải lớn hơn 0");
        }
        if (payload.getDuration() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thời lượng phải lớn hơn 0");
        }

        Course sameCode = courseRepo.findByCode(payload.getCode().trim());
        if (sameCode != null && !sameCode.getId().equals(existing.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã khóa học đã tồn tại");
        }

        existing.setCode(payload.getCode().trim());
        existing.setTitle(payload.getTitle().trim());
        existing.setDescription(payload.getDescription());
        existing.setPrice(payload.getPrice());
        existing.setDuration(payload.getDuration());

        return courseRepo.save(existing);
    }

}


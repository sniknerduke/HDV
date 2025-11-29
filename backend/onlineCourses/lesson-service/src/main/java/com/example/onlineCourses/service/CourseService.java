package com.example.onlineCourses.service;

import com.example.onlineCourses.model.Course;
import com.example.onlineCourses.model.Provider;
import com.example.onlineCourses.repository.CourseRepository;
import com.example.onlineCourses.repository.ProviderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepo;

    @Autowired
    private ProviderRepository providerRepo;

    public Course createCourse(Course course) {
        // Nếu không có provider thì chỉ lưu trực tiếp
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


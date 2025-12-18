package com.example.onlineCourses.service;

import com.example.onlineCourses.DTO.UserCourseDto;
import com.example.onlineCourses.model.UserCourse;
import com.example.onlineCourses.repository.UserCourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserCourseService {

    private final UserCourseRepository userCourseRepository;

    public UserCourseService(UserCourseRepository userCourseRepository) {
        this.userCourseRepository = userCourseRepository;
    }

    public List<UserCourseDto> getUserCourses(Long userId) {
        List<UserCourse> courses = userCourseRepository.findByUserId(userId);
        return courses.stream()
                .map(uc -> new UserCourseDto(
                        uc.getUserId(),
                        uc.getCourseId(),
                        uc.getOrderId(),
                        uc.getStatus()
                ))
                .collect(Collectors.toList());
    }

    public UserCourseDto checkAccess(Long userId, Long courseId) {
        Optional<UserCourse> uc = userCourseRepository.findByUserIdAndCourseId(userId, courseId);

        if (uc.isPresent() && "active".equalsIgnoreCase(uc.get().getStatus())) {
            return new UserCourseDto(
                    uc.get().getUserId(),
                    uc.get().getCourseId(),
                    uc.get().getOrderId(),
                    uc.get().getStatus()
            );
        }
        return null; // chưa có quyền
    }

    public UserCourseDto createUserCourse(Long userId, Long courseId, String orderId) {
        // Kiểm tra đã tồn tại chưa
        Optional<UserCourse> existing = userCourseRepository.findByUserIdAndCourseId(userId, courseId);
        if (existing.isPresent()) {
            UserCourse uc = existing.get();
            return new UserCourseDto(uc.getUserId(), uc.getCourseId(), uc.getStatus());
        }

        // Tạo mới
        UserCourse uc = new UserCourse();
        uc.setUserId(userId);
        uc.setCourseId(courseId);
        uc.setOrderId(orderId);       // bắt buộc set vì nullable=false
        uc.setStatus("ENROLLED");     // hoặc trạng thái mặc định

        UserCourse saved = userCourseRepository.save(uc);

        return new UserCourseDto(saved.getUserId(), saved.getCourseId(), saved.getStatus());
    }


}


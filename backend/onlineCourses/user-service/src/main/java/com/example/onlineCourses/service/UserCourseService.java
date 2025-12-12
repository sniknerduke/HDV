package com.example.onlineCourses.service;

import com.example.onlineCourses.DTO.UserCourseDto;
import com.example.onlineCourses.model.UserCourse;
import com.example.onlineCourses.repository.UserCourseRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserCourseService {

    private final UserCourseRepository userCourseRepository;

    public UserCourseService(UserCourseRepository userCourseRepository) {
        this.userCourseRepository = userCourseRepository;
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
}


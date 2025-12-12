package com.example.onlineCourses.controller;

import com.example.onlineCourses.DTO.UserCourseDto;
import com.example.onlineCourses.service.UserCourseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user-courses")
public class UserCourseController {

    private final UserCourseService userCourseService;

    public UserCourseController(UserCourseService userCourseService) {
        this.userCourseService = userCourseService;
    }

    // GET /api/user-courses/check?userId=123&courseId=456
    @GetMapping("/check")
    public ResponseEntity<UserCourseDto> checkAccess(
            @RequestParam Long userId,
            @RequestParam Long courseId) {

        UserCourseDto result = userCourseService.checkAccess(userId, courseId);

        if (result == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(result);
    }
}


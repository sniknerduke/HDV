package com.example.onlineCourses.controller.client;

import com.example.onlineCourses.DTO.CourseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

//@FeignClient(name = "courses")
public interface  LessonClient {
//    @GetMapping("internal/id/{id}")
//    CourseDTO getById(@PathVariable Long id);
}

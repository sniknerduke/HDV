package com.example.onlineCourses.clients;

import com.example.onlineCourses.DTO.CourseDTO;
import com.example.onlineCourses.config.FeignConfig;
import org.springframework.boot.web.client.RestTemplateBuilder;
//import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.client.RestTemplate;

@FeignClient(name = "api-gateway", configuration = FeignConfig.class) // gọi theo tên service đã đăng ký trong Eureka
public interface CourseClient {
    @GetMapping("/api/courses/id/{id}")
    CourseDTO getCourseById(@PathVariable("id") Long id);
}


//@FeignClient(name = "lesson-service", url = "http://localhost:8082")
//public interface CourseClient {
//@Service
//public class CourseClient {
//    private final RestTemplate restTemplate;
//    public CourseClient(RestTemplateBuilder builder) {
//        this.restTemplate = builder.build();
//    }
//
//    public CourseDTO getCourseById(Long id) {
//        return restTemplate.getForObject(
////                "http://localhost:8082/api/courses/id/{id}",
//                "http://lesson-service/api/courses/id/{id}", // gọi theo tên service
//                CourseDTO.class,
//                id
//        );
//    }
//}


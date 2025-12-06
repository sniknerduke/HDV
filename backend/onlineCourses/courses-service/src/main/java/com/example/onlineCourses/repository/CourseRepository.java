package com.example.onlineCourses.repository;

import com.example.onlineCourses.model.Course;
import com.example.onlineCourses.model.Provider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
     Course findByCode(String code);

//     List<Course> findByProvider(Provider provider);
//    List<Course> findByProviderId(Long providerId);


}

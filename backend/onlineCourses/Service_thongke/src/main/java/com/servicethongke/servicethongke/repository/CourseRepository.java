package com.servicethongke.servicethongke.repository;

import com.servicethongke.servicethongke.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
// Thực hiện đủ chức năng cơ bản: findById, findAll, save, ...
    // Nếu bạn có nhu cầu tìm course theo code:
    // Optional<Course> findByCode(String code);
}

package com.example.onlineCourses.repository;

import com.example.onlineCourses.model.Enrollment;
import com.example.onlineCourses.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    void deleteByUser(User user);
}

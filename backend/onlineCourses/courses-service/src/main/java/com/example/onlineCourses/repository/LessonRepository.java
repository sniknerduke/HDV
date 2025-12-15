package com.example.onlineCourses.repository;

import com.example.onlineCourses.model.Course;
import com.example.onlineCourses.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByCourseOrderByOrderIndexAscIdAsc(Course course);
    Optional<Lesson> findByCourseAndVideoUrl(Course course, String videoUrl);
    long countByCourse(Course course);
}

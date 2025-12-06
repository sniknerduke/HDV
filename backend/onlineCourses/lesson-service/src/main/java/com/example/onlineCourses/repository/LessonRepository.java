package com.example.onlineCourses.repository;

import com.example.onlineCourses.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findBySectionIdOrderByPositionAsc(Long sectionId);
    Optional<Lesson> findByIdAndSectionId(Long id, Long sectionId);
    long countBySectionId(Long sectionId);
}
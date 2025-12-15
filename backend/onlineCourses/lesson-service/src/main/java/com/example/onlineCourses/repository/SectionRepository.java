package com.example.onlineCourses.repository;

import com.example.onlineCourses.model.Section;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface SectionRepository extends JpaRepository<Section, Long> {
    List<Section> findByCourseIdOrderByPositionAsc(Long courseId);
    Optional<Section> findFirstByCourseIdOrderByPositionAsc(Long courseId);
}
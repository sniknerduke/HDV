package com.example.onlineCourses.repository;

import com.example.onlineCourses.model.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface SectionRepository extends JpaRepository<Section, Long> {
    List<Section> findByCourseIdOrderByPositionAsc(Long courseId);
    Optional<Section> findFirstByCourseIdOrderByPositionAsc(Long courseId);

    @Modifying
    @Query("DELETE FROM Section s WHERE s.courseId = :courseId")
    void deleteByCourseId(@Param("courseId") Long courseId);
}
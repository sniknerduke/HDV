package com.example.onlineCourses.repository;

import com.example.onlineCourses.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findBySectionIdOrderByPositionAsc(Long sectionId);
    Optional<Lesson> findByIdAndSectionId(Long id, Long sectionId);
    long countBySectionId(Long sectionId);

    @Modifying
    @Query("DELETE FROM Lesson l WHERE l.section.id = :sectionId")
    void deleteBySectionId(@Param("sectionId") Long sectionId);

    @Modifying
    @Query("DELETE FROM Lesson l WHERE l.section.id IN :sectionIds")
    void deleteBySectionIdIn(@Param("sectionIds") List<Long> sectionIds);
}
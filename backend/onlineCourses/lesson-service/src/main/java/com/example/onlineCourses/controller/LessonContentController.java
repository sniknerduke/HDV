package com.example.onlineCourses.controller;

import com.example.onlineCourses.dto.LessonRequest;
import com.example.onlineCourses.dto.ReorderRequest;
import com.example.onlineCourses.dto.SectionRequest;
import com.example.onlineCourses.model.Lesson;
import com.example.onlineCourses.model.Section;
import com.example.onlineCourses.service.LessonContentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
public class LessonContentController {

    private final LessonContentService lessonContentService;

    public LessonContentController(LessonContentService lessonContentService) {
        this.lessonContentService = lessonContentService;
    }

    /* -------- Read -------- */
    @PreAuthorize("hasAnyRole('STAFF','MANAGER','ADMIN')")
    @GetMapping("/course/{courseId}/structure")
    public List<Section> getCourseStructure(@PathVariable Long courseId) {
        return lessonContentService.getSectionsWithLessons(courseId);
    }

    /* -------- Sections -------- */
    @PreAuthorize("hasAnyRole('STAFF','MANAGER','ADMIN')")
    @PostMapping("/course/{courseId}/sections")
    public Section createSection(@PathVariable Long courseId, @Valid @RequestBody SectionRequest request) {
        return lessonContentService.createSection(courseId, request);
    }

    // Cascade delete - called by courses-service when deleting a course
    @PreAuthorize("hasAnyRole('STAFF','MANAGER','ADMIN')")
    @DeleteMapping("/course/{courseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCourseContent(@PathVariable Long courseId) {
        lessonContentService.deleteCourseContent(courseId);
    }

    @PreAuthorize("hasAnyRole('STAFF','MANAGER','ADMIN')")
    @PutMapping("/course/{courseId}/sections/{sectionId}")
    public Section updateSection(@PathVariable Long courseId,
                                 @PathVariable Long sectionId,
                                 @Valid @RequestBody SectionRequest request) {
        return lessonContentService.updateSection(courseId, sectionId, request);
    }

    @PreAuthorize("hasAnyRole('STAFF','MANAGER','ADMIN')")
    @DeleteMapping("/course/{courseId}/sections/{sectionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSection(@PathVariable Long courseId, @PathVariable Long sectionId) {
        lessonContentService.deleteSection(courseId, sectionId);
    }

    @PreAuthorize("hasAnyRole('STAFF','MANAGER','ADMIN')")
    @PostMapping("/course/{courseId}/sections/reorder")
    public List<Section> reorderSections(@PathVariable Long courseId, @Valid @RequestBody ReorderRequest request) {
        return lessonContentService.reorderSections(courseId, request);
    }

    /* -------- Lessons -------- */
    @PreAuthorize("hasAnyRole('STAFF','MANAGER','ADMIN')")
    @PostMapping("/course/{courseId}/sections/{sectionId}/lessons")
    public Lesson createLesson(@PathVariable Long courseId,
                               @PathVariable Long sectionId,
                               @Valid @RequestBody LessonRequest request) {
        return lessonContentService.createLesson(courseId, sectionId, request);
    }

    @PreAuthorize("hasAnyRole('STAFF','MANAGER','ADMIN')")
    @PutMapping("/course/{courseId}/sections/{sectionId}/lessons/{lessonId}")
    public Lesson updateLesson(@PathVariable Long courseId,
                               @PathVariable Long sectionId,
                               @PathVariable Long lessonId,
                               @Valid @RequestBody LessonRequest request) {
        return lessonContentService.updateLesson(courseId, sectionId, lessonId, request);
    }

    @PreAuthorize("hasAnyRole('STAFF','MANAGER','ADMIN')")
    @DeleteMapping("/course/{courseId}/sections/{sectionId}/lessons/{lessonId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLesson(@PathVariable Long courseId,
                             @PathVariable Long sectionId,
                             @PathVariable Long lessonId) {
        lessonContentService.deleteLesson(courseId, sectionId, lessonId);
    }

    @PreAuthorize("hasAnyRole('STAFF','MANAGER','ADMIN')")
    @PostMapping("/course/{courseId}/sections/{sectionId}/lessons/reorder")
    public List<Lesson> reorderLessons(@PathVariable Long courseId,
                                       @PathVariable Long sectionId,
                                       @Valid @RequestBody ReorderRequest request) {
        return lessonContentService.reorderLessons(courseId, sectionId, request);
    }
}
package com.example.onlineCourses.controller;

import com.example.onlineCourses.dto.LessonRequest;
import com.example.onlineCourses.model.Lesson;
import com.example.onlineCourses.service.LessonContentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lessons")
public class LessonImportController {

    private final LessonContentService lessonContentService;

    public LessonImportController(LessonContentService lessonContentService) {
        this.lessonContentService = lessonContentService;
    }

    /**
     * Simple endpoint to append a lesson to the first section (or create default) of a course.
     * Adjust as needed for real structure/section selection.
     */
    @PreAuthorize("hasAnyRole('STAFF','MANAGER','ADMIN')")
    @PostMapping("/course/{courseId}/auto-lesson")
    @ResponseStatus(HttpStatus.CREATED)
    public Lesson createLessonAuto(@PathVariable Long courseId,
                                   @Valid @RequestBody LessonRequest request) {
        return lessonContentService.createLessonAuto(courseId, request);
    }
}

package com.example.onlineCourses.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.server.ResponseStatusException;

@FeignClient(name = "lesson-service", url = "http://localhost:8083", path = "/api/lessons")
public interface LessonRemoteClient {

    @PostMapping("/course/{courseId}/import")
    void importLessons(@PathVariable("courseId") Long courseId,
                       @RequestBody ImportLessonsRequest request);

    @PostMapping("/course/{courseId}/auto-lesson")
    void createLesson(@PathVariable("courseId") Long courseId,
                      @RequestBody LessonCreatePayload payload);

    /**
     * Wrapper request for importing multiple lessons at once (optional, if lesson-service supports it).
     */
    class ImportLessonsRequest {
        public java.util.List<LessonCreatePayload> lessons;
    }

    class LessonCreatePayload {
        public String title;
        public String description;
        public String videoUrl;
        public String thumbnailUrl;
        public LessonCreatePayload() {}
        public LessonCreatePayload(String title, String description, String videoUrl, String thumbnailUrl) {
            this.title = title;
            this.description = description;
            this.videoUrl = videoUrl;
            this.thumbnailUrl = thumbnailUrl;
        }
    }

    static ResponseStatusException toRse(Exception e) {
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Lesson service unavailable", e);
    }
}

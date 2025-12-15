package com.example.onlineCourses.service;

import com.example.onlineCourses.model.Course;
import com.example.onlineCourses.repository.CourseRepository;
import com.example.onlineCourses.youtube.YoutubeClient;
import com.example.onlineCourses.youtube.YoutubePlaylistItemsResponse;
import com.example.onlineCourses.client.LessonRemoteClient;
import com.example.onlineCourses.client.LessonRemoteClient.LessonCreatePayload;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;

@Service
public class PlaylistImportService {

    private final CourseRepository courseRepository;
    private final YoutubeClient youtubeClient;
    private final LessonRemoteClient lessonClient;

    public PlaylistImportService(CourseRepository courseRepository,
                                 YoutubeClient youtubeClient,
                                 LessonRemoteClient lessonClient) {
        this.courseRepository = courseRepository;
        this.youtubeClient = youtubeClient;
        this.lessonClient = lessonClient;
    }

    @Transactional
    public ImportResult importPlaylists(Long courseId, List<String> playlistIds) {
        if (playlistIds == null || playlistIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "playlistIds is required");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        int imported = 0;
        // Try to enrich course with first playlist metadata if missing
        try {
            var meta = youtubeClient.fetchPlaylistMetadata(playlistIds.get(0));
            if (meta != null) {
                if (course.getTitle() == null || course.getTitle().isBlank()) {
                    course.setTitle(meta.title());
                }
                if (course.getDescription() == null || course.getDescription().isBlank()) {
                    course.setDescription(meta.description());
                }
                courseRepository.save(course);
            }
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Playlist not found or private");
        } catch (HttpClientErrorException.Forbidden e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "YouTube API limit reached");
        }

        for (String playlistId : playlistIds) {
            List<YoutubePlaylistItemsResponse.Item> items;
            try {
                items = youtubeClient.fetchPlaylistItems(playlistId);
            } catch (HttpClientErrorException.NotFound e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Playlist not found or private");
            } catch (HttpClientErrorException.Forbidden e) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "YouTube API limit reached");
            }

            for (YoutubePlaylistItemsResponse.Item item : items) {
                var snippet = item.snippet();
                if (snippet == null || snippet.resourceId() == null || snippet.resourceId().videoId() == null) {
                    continue;
                }
                String videoId = snippet.resourceId().videoId();
                String videoUrl = "https://www.youtube.com/watch?v=" + videoId;
                // Delegate creation to lesson-service; it can handle dedup/order logic per course/section
                lessonClient.createLesson(course.getId(), new LessonCreatePayload(
                        snippet.title() != null ? snippet.title() : "Video " + videoId,
                        snippet.description(),
                        videoUrl,
                        extractThumbnail(snippet)
                ));
                imported++;
            }
        }

        return new ImportResult(imported);
    }

    private String extractThumbnail(YoutubePlaylistItemsResponse.Snippet snippet) {
        var thumbs = snippet.thumbnails();
        if (thumbs == null) return null;
        var best = thumbs.best();
        return best != null ? best.url() : null;
    }

    public record ImportResult(int imported) {}
}

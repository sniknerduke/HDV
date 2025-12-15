package com.example.onlineCourses.controller;

import com.example.onlineCourses.dto.ImportPlaylistRequest;
import com.example.onlineCourses.service.PlaylistImportService;
import com.example.onlineCourses.service.PlaylistImportService.ImportResult;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courses")
public class PlaylistImportController {

    private final PlaylistImportService playlistImportService;

    public PlaylistImportController(PlaylistImportService playlistImportService) {
        this.playlistImportService = playlistImportService;
    }

    @PreAuthorize("hasAnyRole('STAFF','MANAGER','ADMIN')")
    @PostMapping("/{courseId}/import-playlist")
    @ResponseStatus(HttpStatus.OK)
    public ImportResult importPlaylist(@PathVariable Long courseId,
                                       @Valid @RequestBody ImportPlaylistRequest request) {
        return playlistImportService.importPlaylists(courseId, request.getPlaylistIds());
    }
}

package com.example.onlineCourses.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class ImportPlaylistRequest {
    @NotEmpty
    private List<String> playlistIds;

    public List<String> getPlaylistIds() {
        return playlistIds;
    }

    public void setPlaylistIds(List<String> playlistIds) {
        this.playlistIds = playlistIds;
    }
}

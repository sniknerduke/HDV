package com.example.onlineCourses.youtube;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record YoutubePlaylistResponse(
        @JsonProperty("items") List<Item> items
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Item(@JsonProperty("snippet") Snippet snippet) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Snippet(
            @JsonProperty("title") String title,
            @JsonProperty("description") String description
    ) {}
}

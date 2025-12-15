package com.example.onlineCourses.youtube;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record YoutubePlaylistItemsResponse(
        @JsonProperty("items") List<Item> items,
        @JsonProperty("nextPageToken") String nextPageToken
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Item(@JsonProperty("snippet") Snippet snippet) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Snippet(
            @JsonProperty("title") String title,
            @JsonProperty("description") String description,
            @JsonProperty("position") Integer position,
            @JsonProperty("resourceId") ResourceId resourceId,
            @JsonProperty("thumbnails") Thumbnails thumbnails
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ResourceId(@JsonProperty("videoId") String videoId) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Thumbnails(
            @JsonProperty("maxres") Thumb maxres,
            @JsonProperty("standard") Thumb standard,
            @JsonProperty("high") Thumb high,
            @JsonProperty("medium") Thumb medium,
            @JsonProperty("default") Thumb defaultThumb
    ) {
        public Thumb best() {
            if (maxres != null) return maxres;
            if (standard != null) return standard;
            if (high != null) return high;
            if (medium != null) return medium;
            return defaultThumb;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Thumb(@JsonProperty("url") String url) {}
}

package com.example.onlineCourses.youtube;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;

@Component
public class YoutubeClient {

    private final RestClient restClient;

    @Value("${youtube.api.key}")
    private String apiKey;

    @Value("${youtube.api.base:https://www.googleapis.com/youtube/v3}")
    private String apiBase;

    @Value("${youtube.api.max-results:50}")
    private int maxResults;

    public YoutubeClient(RestClient.Builder builder) {
        this.restClient = builder.build();
    }

    public PlaylistMetadata fetchPlaylistMetadata(String playlistId) {
        String uri = UriComponentsBuilder.fromHttpUrl(apiBase + "/playlists")
                .queryParam("part", "snippet")
                .queryParam("id", playlistId)
                .queryParam("key", apiKey)
                .toUriString();

        ResponseEntity<YoutubePlaylistResponse> res = restClient.get()
                .uri(uri)
                .retrieve()
                .toEntity(YoutubePlaylistResponse.class);

        var body = res.getBody();
        if (body == null || body.items() == null || body.items().isEmpty()) {
            return null;
        }
        var snippet = body.items().get(0).snippet();
        return new PlaylistMetadata(snippet.title(), snippet.description());
    }

    public List<YoutubePlaylistItemsResponse.Item> fetchPlaylistItems(String playlistId) {
        List<YoutubePlaylistItemsResponse.Item> all = new ArrayList<>();
        String pageToken = null;
        do {
            String uri = UriComponentsBuilder.fromHttpUrl(apiBase + "/playlistItems")
                    .queryParam("part", "snippet")
                    .queryParam("playlistId", playlistId)
                    .queryParam("maxResults", maxResults)
                    .queryParam("pageToken", pageToken)
                    .queryParam("key", apiKey)
                    .toUriString();

            ResponseEntity<YoutubePlaylistItemsResponse> res = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .toEntity(YoutubePlaylistItemsResponse.class);

            YoutubePlaylistItemsResponse body = res.getBody();
            if (body == null || body.items() == null) break;
            all.addAll(body.items());
            pageToken = body.nextPageToken();
        } while (pageToken != null && !pageToken.isBlank());

        return all;
    }

    public record PlaylistMetadata(String title, String description) {}
}

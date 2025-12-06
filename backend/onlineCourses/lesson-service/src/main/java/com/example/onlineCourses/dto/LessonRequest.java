package com.example.onlineCourses.dto;

import jakarta.validation.constraints.NotBlank;

public class LessonRequest {
    @NotBlank
    private String title;
    private String type;      // video | text | quiz
    private String fileName;
    private String mimeType;
    private Long size;
    private String videoUrl;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }
    public Long getSize() { return size; }
    public void setSize(Long size) { this.size = size; }
    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
}
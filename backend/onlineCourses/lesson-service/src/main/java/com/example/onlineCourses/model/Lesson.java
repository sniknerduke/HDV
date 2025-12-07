package com.example.onlineCourses.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "lessons")
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id")
    @JsonBackReference
    private Section section;

    @NotBlank
    private String title;

    private String type;      // video | text | quiz
    private String videoUrl;

    /**
     * Vị trí trong section (0-based).
     */
    private Integer position;

    @PrePersist
    public void prePersist() {
        if (position == null) position = 0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Section getSection() { return section; }
    public void setSection(Section section) { this.section = section; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }
}
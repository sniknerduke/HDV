package com.example.onlineCourses.service;

import com.example.onlineCourses.dto.LessonRequest;
import com.example.onlineCourses.dto.ReorderRequest;
import com.example.onlineCourses.dto.SectionRequest;
import com.example.onlineCourses.model.Lesson;
import com.example.onlineCourses.model.Section;
import com.example.onlineCourses.repository.LessonRepository;
import com.example.onlineCourses.repository.SectionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class LessonContentService {
    private final SectionRepository sectionRepo;
    private final LessonRepository lessonRepo;

    public LessonContentService(SectionRepository sectionRepo, LessonRepository lessonRepo) {
        this.sectionRepo = sectionRepo;
        this.lessonRepo = lessonRepo;
    }

    /* ---------------------- Section ---------------------- */
    public List<Section> getSectionsWithLessons(Long courseId) {
        List<Section> sections = sectionRepo.findByCourseIdOrderByPositionAsc(courseId);
        sections.forEach(s -> s.getLessons().size()); // force init to avoid lazy issues
        return sections;
    }

    @Transactional
    public Section createSection(Long courseId, SectionRequest req) {
        Section s = new Section();
        s.setCourseId(courseId);
        s.setTitle(req.getTitle().trim());
        s.setDescription(StringUtils.hasText(req.getDescription()) ? req.getDescription().trim() : null);
        s.setPosition(nextSectionPos(courseId));
        return sectionRepo.save(s);
    }

    @Transactional
    public Section updateSection(Long courseId, Long sectionId, SectionRequest req) {
        Section s = findSection(courseId, sectionId);
        if (StringUtils.hasText(req.getTitle())) s.setTitle(req.getTitle().trim());
        s.setDescription(StringUtils.hasText(req.getDescription()) ? req.getDescription().trim() : null);
        return sectionRepo.save(s);
    }

    @Transactional
    public void deleteSection(Long courseId, Long sectionId) {
        Section s = findSection(courseId, sectionId);
        sectionRepo.delete(s); // cascade removes lessons
    }

    @Transactional
    public List<Section> reorderSections(Long courseId, ReorderRequest req) {
        List<Section> sections = sectionRepo.findByCourseIdOrderByPositionAsc(courseId);
        moveItem(sections, req.getFromIndex(), req.getToIndex());
        persistSectionPositions(sections);
        return sections;
    }

    private void persistSectionPositions(List<Section> sections) {
        for (int i = 0; i < sections.size(); i++) {
            sections.get(i).setPosition(i);
        }
        sectionRepo.saveAll(sections);
    }

    private int nextSectionPos(Long courseId) {
        List<Section> list = sectionRepo.findByCourseIdOrderByPositionAsc(courseId);
        return list.size();
    }

    private Section findSection(Long courseId, Long sectionId) {
        return sectionRepo.findById(sectionId)
                .filter(s -> s.getCourseId().equals(courseId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Section not found"));
    }

    /* ---------------------- Lesson ---------------------- */
    @Transactional
    public Lesson createLesson(Long courseId, Long sectionId, LessonRequest req) {
        Section section = findSection(courseId, sectionId);
        Lesson l = new Lesson();
        l.setSection(section);
        l.setTitle(req.getTitle().trim());
        l.setType(req.getType());
        l.setVideoUrl(req.getVideoUrl());
        l.setPosition(nextLessonPos(sectionId));
        return lessonRepo.save(l);
    }

    @Transactional
    public Lesson updateLesson(Long courseId, Long sectionId, Long lessonId, LessonRequest req) {
        Lesson l = findLesson(courseId, sectionId, lessonId);
        if (StringUtils.hasText(req.getTitle())) l.setTitle(req.getTitle().trim());
        if (req.getType() != null) l.setType(req.getType());
        if (req.getVideoUrl() != null) l.setVideoUrl(req.getVideoUrl());
        return lessonRepo.save(l);
    }

    @Transactional
    public void deleteLesson(Long courseId, Long sectionId, Long lessonId) {
        Lesson l = findLesson(courseId, sectionId, lessonId);
        lessonRepo.delete(l);
        // normalize positions
        List<Lesson> list = lessonRepo.findBySectionIdOrderByPositionAsc(sectionId);
        persistLessonPositions(list);
    }

    /**
     * Auto-attach a lesson to the first section (or create a default section if none exists).
     * Used by import flow.
     */
    public Lesson createLessonAuto(Long courseId, LessonRequest request) {
        // try find existing section, else create default
        Section section = sectionRepo.findFirstByCourseIdOrderByPositionAsc(courseId)
                .orElseGet(() -> {
                    Section s = new Section();
                    s.setCourseId(courseId);
                    s.setTitle("Mục 1");
                    s.setPosition(0);
                    return sectionRepo.save(s);
                });

        Lesson lesson = new Lesson();
        lesson.setSection(section);
        lesson.setTitle(request.getTitle());
        lesson.setType(request.getType());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setPosition((int) lessonRepo.countBySectionId(section.getId()));
        return lessonRepo.save(lesson);
    }

    @Transactional
    public List<Lesson> reorderLessons(Long courseId, Long sectionId, ReorderRequest req) {
        // ensure section exists
        findSection(courseId, sectionId);
        List<Lesson> lessons = lessonRepo.findBySectionIdOrderByPositionAsc(sectionId);
        moveItem(lessons, req.getFromIndex(), req.getToIndex());
        persistLessonPositions(lessons);
        return lessons;
    }

    private void persistLessonPositions(List<Lesson> lessons) {
        for (int i = 0; i < lessons.size(); i++) {
            lessons.get(i).setPosition(i);
        }
        lessonRepo.saveAll(lessons);
    }

    private int nextLessonPos(Long sectionId) {
        return (int) lessonRepo.countBySectionId(sectionId);
    }

    private Lesson findLesson(Long courseId, Long sectionId, Long lessonId) {
        Section section = findSection(courseId, sectionId);
        return lessonRepo.findByIdAndSectionId(lessonId, section.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
    }

    /* ---------------------- Helpers ---------------------- */
    private <T> void moveItem(List<T> list, int from, int to) {
        if (from < 0 || from >= list.size() || to < 0 || to >= list.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid from/to index");
        }
        if (from == to) return;
        List<T> tmp = new ArrayList<>(list);
        T item = tmp.remove(from);
        tmp.add(to, item);
        list.clear();
        list.addAll(tmp);
    }
}
package com.example.onlineCourses.controller;

import com.example.onlineCourses.model.Course;
import com.example.onlineCourses.repository.CourseRepository;
//import com.example.onlineCourses.model.Provider;
//import com.example.onlineCourses.repository.ProviderRepository;
import com.example.onlineCourses.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {
    @Autowired
    private CourseService courseService;

    @PreAuthorize("hasAnyRole('STAFF','MANAGER','ADMIN')")
    @PostMapping("/public/create")
    public Course createCourse(@RequestBody Course course, Authentication authentication) {
        String owner = authentication != null ? authentication.getName() : null;
        return courseService.createCourse(course, owner);
    }

    @PreAuthorize("hasAnyRole('STAFF','MANAGER','ADMIN')")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
    }

    @PreAuthorize("hasAnyRole('STAFF','MANAGER','ADMIN')")
    @PutMapping("/{id}")
    public Course updateCourse(@PathVariable Long id, @RequestBody Course course) {
        return courseService.updateCourse(id, course);
    }

//    public Course createCourse(@PathVariable Long providerId, @RequestBody Course course) {
//        return courseService.createCourse( course);
//    }

//    @GetMapping("/provider/{providerId}")
//    public List<Course> getCoursesByProvider(@PathVariable Long providerId) {
//        return courseService.getCoursesByProvider(providerId);
//    }

    @PreAuthorize("hasAnyRole('USER','STAFF','MANAGER','ADMIN')")
    @GetMapping("/list")
    public List<Course> getAllCourses(Authentication authentication) {
        Authentication auth = authentication != null ? authentication : SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        if (isAdmin) {
            return courseService.getAllCourses();
        }
        String owner = auth != null ? auth.getName() : null;
        return courseService.getCoursesByOwner(owner);
    }

    @PreAuthorize("hasAnyRole('USER','STAFF','MANAGER','ADMIN')")
    @GetMapping("/{code}")
    public Course getByCode(@PathVariable String code) {
        return courseService.getByCode(code);
    }

    @GetMapping("id/{id}")
    public Course getById(@PathVariable Long id) {
        return courseService.getById(id);
    }

    // Public list for guest users (no auth)
    @GetMapping("/public/list")
    public List<Course> getAllCoursesPublic() {
        return courseService.getAllCourses();
    }

    @PreAuthorize("hasAnyRole('USER','STAFF','MANAGER','ADMIN')")
    @PostMapping("/batch")
    public List<Course> getCoursesByIds(@RequestBody List<Long> ids) {
        return courseService.getCoursesByIds(ids);
    }

    // GET /by-ids?ids=1,2,3 - for fetching multiple courses by IDs
    @PreAuthorize("hasAnyRole('USER','STAFF','MANAGER','ADMIN')")
    @GetMapping("/by-ids")
    public List<Course> getCoursesByIdsParam(@RequestParam List<Long> ids) {
        return courseService.getCoursesByIds(ids);
    }

}

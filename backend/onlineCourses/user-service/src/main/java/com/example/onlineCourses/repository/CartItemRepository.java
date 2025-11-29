package com.example.onlineCourses.repository;

import com.example.onlineCourses.DTO.CourseDTO;
import com.example.onlineCourses.model.CartItem;
import com.example.onlineCourses.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
//    Optional<CartItem> findByUserAndCourse(User user, Long courseId);
//    List<CartItem> findByUser(User user);
    Optional<CartItem> findByUserIdAndCourseId(Long userId, Long courseId);
    List<CartItem> findByUserId(Long userId);
    @Modifying
    @Transactional
    void deleteByUserId(Long userId);
//    void deleteByCartItemId(Long cartItemId);

}
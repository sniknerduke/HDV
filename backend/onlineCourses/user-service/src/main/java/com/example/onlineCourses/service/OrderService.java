package com.example.onlineCourses.service;

import com.example.onlineCourses.DTO.CourseDTO;
import com.example.onlineCourses.clients.CourseClient;
import com.example.onlineCourses.model.CartItem;
import com.example.onlineCourses.model.Order;
import com.example.onlineCourses.model.User;
import com.example.onlineCourses.repository.CartItemRepository;
import com.example.onlineCourses.repository.OrderRepository;
import com.example.onlineCourses.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepo;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private CartItemRepository cartItemRepo;
    @Autowired
    private CourseClient courseClient;
    // FeignClient dùng để gọi sang Course Service


}

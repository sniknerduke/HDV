package com.example.onlineCourses.service;

import com.example.onlineCourses.DTO.CartItemDTO;
import com.example.onlineCourses.DTO.CourseDTO;
import com.example.onlineCourses.clients.CourseClient;
import com.example.onlineCourses.model.CartItem;
import com.example.onlineCourses.model.Order;
import com.example.onlineCourses.model.OrderItem;
import com.example.onlineCourses.model.User;
import com.example.onlineCourses.repository.CartItemRepository;
import com.example.onlineCourses.repository.OrderRepository;
import com.example.onlineCourses.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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

    public Order checkout(Long userId) {
        List<CartItem> cartItems = cartItemRepo.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Giỏ hàng đang trống");
        }

        long total = 0;
        List<OrderItem> orderItems = new ArrayList<>();

        // 2. Tạo order trước để có tham chiếu
        Order order = new Order();
        order.setUserId(userId);
        order.setOrderId(UUID.randomUUID().toString());
        order.setStatus("PENDING");
        // 2. Với mỗi item → gọi CourseService lấy giá/title
        for (CartItem item : cartItems) {
            if (item.getCourseId() == null) continue;

            CourseDTO course = courseClient.getCourseById(item.getCourseId());
            if (course == null) {
                throw new RuntimeException("Course not found: " + item.getCourseId());
            }

            total += course.price() ;


            // Build OrderItem từ dữ liệu mới nhất
            OrderItem oi = new OrderItem();
            oi.setCourseId(course.id());
            oi.setCourseName(course.title());
            oi.setPrice(course.price());
            oi.setOrder(order); // gắn với order đã khởi tạo
            orderItems.add(oi);
        }

        order.setAmount(total);
        order.setItems(orderItems);

// 5. Lưu order
        Order savedOrder = orderRepo.save(order);
        return savedOrder;
    }

//    public void updateStatus(Long id, String status) {
//        Order order = orderRepo.findById(id)
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
//        order.setStatus(status);
//        orderRepo.save(order);
//    }

    public void updateStatus(String orderId, String status) {
        Order order = orderRepo.findByOrderId(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        order.setStatus(status);
        orderRepo.save(order);
    }

}

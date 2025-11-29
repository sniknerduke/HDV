package com.example.onlineCourses.controller;

import com.example.onlineCourses.DTO.OrderStatusUpdateRequest;
import com.example.onlineCourses.model.CartItem;
import com.example.onlineCourses.model.Order;
import com.example.onlineCourses.repository.OrderRepository;
import com.example.onlineCourses.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000") // cho phép React gọi
public class OrderController {

    private final OrderRepository orderRepo;
    private final CartService cartService;

    public OrderController(OrderRepository orderRepo, CartService cartService) {
        this.orderRepo = orderRepo;
        this.cartService = cartService;
    }

    @PostMapping("/checkout")
//    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Order> checkout(@RequestParam Long userId) {
        Order order = cartService.checkout(userId);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderByOrderId(@PathVariable String orderId) {
        return orderRepo.findByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //chưa sửa
    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepo.findAll();
    }
    // Tạo đơn hàng từ giỏ hàng
//    @PostMapping("/checkout")
//    public ResponseEntity<Order> checkout(@RequestBody List<CartItem> cartItems,
//                                          @RequestParam Long userId) {
//        long totalAmount = cartItems.stream()
//                .mapToLong(item -> item.getPrice() * item.getQuantity())
//                .sum();
//
//        Order order = new Order();
//        order.setUserId(userId);
//        order.setAmount(totalAmount);
//        order.setStatus("PENDING");
//        orderRepo.save(order);
//
//        return ResponseEntity.ok(order);
//    }
//    @PostMapping("/checkout")
//    @PreAuthorize("hasRole('USER')")
//    public ResponseEntity<Order> checkout(@RequestParam Long userId) {
//        Order order = cartService.checkout(userId);
//        return ResponseEntity.ok(order);
//    }


    //chưa sửa
//    // Lấy đơn hàng theo ID
//    @GetMapping("/{orderId}")
//    @PreAuthorize("hasRole('USER')")
//    public ResponseEntity<Order> getOrder(@PathVariable String orderId) {
//        return orderRepo.findByOrderId(orderId)
//                .map(ResponseEntity::ok)
//                .orElse(ResponseEntity.notFound().build());
//    }

//    @GetMapping("/id/{id}")
//    @PreAuthorize("hasRole('USER')")
//    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
//        return orderRepo.findById(id)
//                .map(ResponseEntity::ok)
//                .orElse(ResponseEntity.notFound().build());
//    }



}


package com.example.onlineCourses.controller;

import com.example.onlineCourses.DTO.OrderStatusUpdateRequest;
import com.example.onlineCourses.model.CartItem;
import com.example.onlineCourses.model.Order;
import com.example.onlineCourses.repository.OrderRepository;
import com.example.onlineCourses.service.CartService;
import com.example.onlineCourses.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
//@CrossOrigin(origins = "http://localhost:3000") // cho phép React gọi
public class OrderController {

    private final OrderRepository orderRepo;
    private final CartService cartService;
    private final OrderService orderService;


    public OrderController(OrderRepository orderRepo, CartService cartService, OrderService orderService) {
        this.orderRepo = orderRepo;
        this.cartService = cartService;
        this.orderService = orderService;
    }


    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderByOrderId(@PathVariable String orderId) {
        return orderRepo.findByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

//    @PreAuthorize("hasRole('USER')")
    @PostMapping("/checkout")
    public ResponseEntity<Order> checkout(
            @RequestHeader("X-User-Id") Long userId
    ) {
        try {
            Order order = orderService.checkout(userId);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    //    @PreAuthorize("hasRole('USER')")
    @PostMapping("/update-status")
    public ResponseEntity<Void> updateStatus(@RequestBody Map<String, Object> payload, @RequestHeader Map<String, String> headers) {
        // Log headers
        System.out.println("Request Headers: " + headers);
        // Log payload
        System.out.println("Request Body: " + payload);

        String orderId = (String) payload.get("orderId");
        String status = (String) payload.get("status");

        orderService.updateStatus(orderId, status);

        return ResponseEntity.ok().build();
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

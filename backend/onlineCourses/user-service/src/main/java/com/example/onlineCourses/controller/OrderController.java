package com.example.onlineCourses.controller;

import com.example.onlineCourses.DTO.OrderStatusUpdateRequest;
import com.example.onlineCourses.model.CartItem;
import com.example.onlineCourses.model.Order;
import com.example.onlineCourses.repository.OrderItemRepository;
import com.example.onlineCourses.repository.OrderRepository;
import com.example.onlineCourses.service.CartService;
import com.example.onlineCourses.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
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

    @GetMapping("/id/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
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
//    public ResponseEntity<Void> updateStatus(@RequestBody Map<String, Object> payload, @RequestHeader Map<String, String> headers) {
    public ResponseEntity<Void> updateStatus(@RequestBody OrderStatusUpdateRequest request) {
        // Log headers
//        System.out.println("Request Headers: " + headers);
        // Log payload
//        System.out.println("Request Body: " + payload);
//
//        String orderId = (String) payload.get("orderId");
//        String status = (String) payload.get("status");

//        orderService.updateStatus(orderId, status);
        orderService.updateStatus(request.getOrderId(), request.getStatus());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    //chưa sửa
    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @GetMapping("/status")
    public List<Order> getOrders(@RequestParam(required = false) String status) {
        if (status != null) {
            return orderRepo.findByStatusOrderByCreatedAtDesc(status);
        }
        return orderRepo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

//    @GetMapping("/filter")
//    public List<Order> filterOrders(@RequestParam String start, @RequestParam String end) {
//        LocalDateTime s = LocalDateTime.parse(start);
//        LocalDateTime e = LocalDateTime.parse(end);
//        return orderRepo.findByCreatedAtBetweenOrderByCreatedAtDesc(s, e);
//    }
@GetMapping("/filter")
public List<Order> filterOrders(
        @RequestParam String start,
        @RequestParam String end,
        @RequestParam(required = false) String status) {

    LocalDateTime s = LocalDateTime.parse(start);
    LocalDateTime e = LocalDateTime.parse(end);

    if (status != null) {
        return orderRepo.findByStatusAndCreatedAtBetweenOrderByCreatedAtDesc(status, s, e);
    }
    return orderRepo.findByCreatedAtBetweenOrderByCreatedAtDesc(s, e);
}




    // dùng để thống kê
    @Autowired // Hoặc thêm vào constructor
    private OrderItemRepository orderItemRepository;
    // Thêm API này để Service_thongke gọi
    @GetMapping("/internal/stats")
    public List<com.example.onlineCourses.DTO.SalesSummaryDTO> getSalesStats(
            @RequestParam("start") String start, // Dạng String ISO hoặc format tùy ý
            @RequestParam("end") String end) {

        // Convert String sang LocalDateTime (Giả sử client gửi yyyy-MM-ddTHH:mm:ss)
        LocalDateTime startDate = LocalDateTime.parse(start);
        LocalDateTime endDate = LocalDateTime.parse(end);

        return orderItemRepository.findSalesStatistics(startDate, endDate);
    }
    // hết
}

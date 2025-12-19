package com.example.onlineCourses.controller;

import com.example.onlineCourses.DTO.OrderItemDTO;
import com.example.onlineCourses.service.OrderItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders/order-items")
public class OrderItemController {

    private final OrderItemService orderItemService;

    public OrderItemController(OrderItemService orderItemService) {
        this.orderItemService = orderItemService;
    }

    // GET /api/orders/{orderId}/items
    @GetMapping("/{orderId}/items")
    public ResponseEntity<List<OrderItemDTO>> getOrderItems(@PathVariable Long orderId, @RequestHeader("X-User-Id") Long userId
    ) {
        List<OrderItemDTO> items = orderItemService.getOrderItemsByOrderId(orderId);
        return ResponseEntity.ok(items);
    }

//    // GET /api/order-items?orderId=123
//    @GetMapping
//    public ResponseEntity<List<OrderItemDTO>> getOrderItems(@RequestParam Long orderId) {
//        List<OrderItemDTO> items = orderItemService.getOrderItemsByOrderId(orderId);
//        return ResponseEntity.ok(items);
//    }
}


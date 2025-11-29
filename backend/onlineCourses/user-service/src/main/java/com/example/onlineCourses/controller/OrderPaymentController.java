package com.example.onlineCourses.controller;

import com.example.onlineCourses.model.Order;
import com.example.onlineCourses.repository.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;


import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderPaymentController {

    private final OrderRepository orderRepo;
    private final RestTemplate restTemplate = new RestTemplate();

    public OrderPaymentController(OrderRepository orderRepo) {
        this.orderRepo = orderRepo;
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Order> getOrder(@PathVariable String orderId) {
        return orderRepo.findByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{orderId}/pay")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, String>> pay(@PathVariable String orderId) {
        Order order = orderRepo.findByOrderId(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        Map<String, Object> req = new HashMap<>();
        req.put("orderId", order.getOrderId());
        req.put("amount", order.getAmount());
        req.put("returnUrl", "http://localhost:3000/vnpay-return"); // frontend main project
        req.put("ipAddress", "127.0.0.1");

        Map resp = restTemplate.postForObject(
                "http://localhost:8081/payment/vnpay/create",
                req, Map.class
        );

        return ResponseEntity.ok(Map.of("paymentUrl", (String) resp.get("paymentUrl")));
    }

//    @PostMapping("/vnpay/ipn")
//    public ResponseEntity<String> handleIpn(@RequestParam Map<String, String> params) {
//        String responseCode = params.get("vnp_ResponseCode");
//        String txnRef = params.get("vnp_TxnRef");
//
//        // TODO: xác thực chữ ký vnp_SecureHash ở đây
//
//        if ("00".equals(responseCode)) {
//            // cập nhật trạng thái đơn hàng thành PAID
//            orderRepo.findByOrderId(txnRef).ifPresent(order -> {
//                order.setStatus("PAID");
//                orderRepo.save(order);
//            });
//            return ResponseEntity.ok("OK");
//        } else {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("FAILED");
//        }
//    }

//    @GetMapping("/vnpay/return")
//    public ResponseEntity<String> handleReturn(@RequestParam Map<String, String> params) {
//        String responseCode = params.get("vnp_ResponseCode");
//        String txnRef = params.get("vnp_TxnRef");
//
//        if ("00".equals(responseCode)) {
//            return ResponseEntity.ok("Thanh toán thành công cho đơn hàng " + txnRef);
//        } else {
//            return ResponseEntity.ok("Thanh toán thất bại cho đơn hàng " + txnRef);
//        }
//    }

}


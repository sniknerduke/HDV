package com.example.onlineCourses.controller;

import com.example.onlineCourses.model.Order;
import com.example.onlineCourses.model.VNPayRequest;
import com.example.onlineCourses.service.CartService;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/payment")
public class PaymentForwardController {
    private CartService cartService;

//    @PostMapping("/create")
//    public ResponseEntity<Map<String, String>> forwardToGateway(@RequestBody VNPayRequest request) {
//        RestTemplate restTemplate = new RestTemplate();
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_JSON);
//
//        HttpEntity<VNPayRequest> entity = new HttpEntity<>(request, headers);
//        ResponseEntity<Map> response = restTemplate.postForEntity(
//                "http://localhost:8081/payment/vnpay/create", entity, Map.class);
//
//        // chỉ lấy paymentUrl từ response của Payment Service
//        String paymentUrl = (String) response.getBody().get("paymentUrl");
//
//        return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl));
//    }

//    @PostMapping("/create")
//    public ResponseEntity<Map<String, String>> forwardToGateway(@RequestParam Long userId) {
//        // B1: Checkout để tạo đơn hàng mới
//        Order order = cartService.checkout(userId);
//
//        // B2: Tạo VNPayRequest với orderId mới
//        VNPayRequest request = new VNPayRequest();
//        request.setOrderId(order.getOrderId()); // chính là vnp_TxnRef
//        request.setAmount(order.getAmount());
//        //request.setDescription("Thanh toán khóa học");
//
//        RestTemplate restTemplate = new RestTemplate();
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_JSON);
//
//        HttpEntity<VNPayRequest> entity = new HttpEntity<>(request, headers);
//        ResponseEntity<Map> response = restTemplate.postForEntity(
//                "http://localhost:8081/payment/vnpay/create", entity, Map.class);
//
//        String paymentUrl = (String) response.getBody().get("paymentUrl");
//
//        return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl));
//    }



//    @PostMapping("ipn")
//    public ResponseEntity<?> handleVNPayCallback(@RequestBody Map<String, String> payload) {
//        String orderId = payload.get("vnp_TxnRef");
//        String status = payload.get("vnp_TransactionStatus");
//
//
//        // Cập nhật trạng thái đơn hàng trong DB
//        return ResponseEntity.ok("IPN received");
//    }

}


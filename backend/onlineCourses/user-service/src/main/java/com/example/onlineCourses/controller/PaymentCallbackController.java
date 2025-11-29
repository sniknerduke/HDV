package com.example.onlineCourses.controller;

//import com.example.onlineCourses.model.Invoice;
import com.example.onlineCourses.model.Order;
//import com.example.onlineCourses.repository.InvoiceRepository;
import com.example.onlineCourses.repository.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/payment/callback")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentCallbackController {

    private final OrderRepository orderRepo;
    //private final InvoiceRepository invoiceRepo;

    public PaymentCallbackController(OrderRepository orderRepo) {
        this.orderRepo = orderRepo;
        //this.invoiceRepo = invoiceRepo;
    }

    @PostMapping("/vnpay")
//    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> updateOrder(@RequestBody Map<String, Object> payload) {
        // payload gửi từ Payment Service: { orderId, amount, status, vnpTransactionNo, vnpResponseCode }
        String orderId = (String) payload.get("orderId");
        String status = (String) payload.get("status");
        Long amount = Long.valueOf(String.valueOf(payload.getOrDefault("amount", 0)));

        Order order = orderRepo.findByOrderId(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if ("SUCCESS".equalsIgnoreCase(status) || "PAID".equalsIgnoreCase(status)) {
            order.setStatus("PAID");
            orderRepo.save(order);

//            Invoice invoice = new Invoice();
//            invoice.setOrderId(order.getOrderId());
//            invoice.setUserId(order.getUserId());
//            invoice.setAmount(order.getAmount());
//            invoice.setPaymentMethod("VNPay");
//            invoice.setStatus("PAID");
//            invoice.setIssuedAt(LocalDateTime.now());
//            invoiceRepo.save(invoice);
        } else {
            order.setStatus("FAILED");
            orderRepo.save(order);
        }

        System.out.println("Callback VNPay: orderId=" + orderId + ", status=" + status);
        return ResponseEntity.ok("OK");
    }
}


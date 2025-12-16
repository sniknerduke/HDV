package com.hdv.payment.controller;

import com.hdv.payment.model.PaymentTransaction;
import com.hdv.payment.repository.PaymentTransactionRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/payment/vnpay/transactions")
//@CrossOrigin(origins = "http://localhost:3000") // cho phép React gọi

public class PaymentTransactionController {

    private final PaymentTransactionRepository repo;

    public PaymentTransactionController(PaymentTransactionRepository repo) {
        this.repo = repo;

    }

    // Lấy tất cả transaction
//    @PreAuthorize("hasRole('USER')")
    @GetMapping
    public List<PaymentTransaction> getAll() {
        return repo.findAll();
    }

    // Lấy theo orderId
    @GetMapping("/{orderId}")
     public Optional<PaymentTransaction> getByOrderId(@PathVariable String orderId) {
        return repo.findByOrderId(orderId);
    }

}


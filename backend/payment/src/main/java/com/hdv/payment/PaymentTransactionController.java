package com.hdv.payment;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/transactions")
@CrossOrigin(origins = "http://localhost:3000") // cho phép React gọi

public class PaymentTransactionController {

    private final PaymentTransactionRepository repo;

    public PaymentTransactionController(PaymentTransactionRepository repo) {
        this.repo = repo;

    }

    // Lấy tất cả transaction
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


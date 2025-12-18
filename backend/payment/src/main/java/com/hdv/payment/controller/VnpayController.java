package com.hdv.payment.controller;

import com.hdv.payment.model.PaymentCreateRequest;
import com.hdv.payment.model.PaymentCreateResponse;
import com.hdv.payment.model.PaymentTransaction;
import com.hdv.payment.repository.PaymentTransactionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;

@RestController
@RequestMapping("/api/payment/vnpay")
//@CrossOrigin(origins = "http://localhost:3000") // cho phép React gọi
public class VnpayController {

    private final PaymentTransactionRepository repo;

    public VnpayController(PaymentTransactionRepository repo) {
        this.repo = repo;
    }

    // cấu hình VNPay – dùng giá trị bạn đã nhận được
    private static final String VNP_TMNCODE = "HFH0EW8X";
    private static final String VNP_HASHSECRET = "5P56F0FIWJVCRBST3WQH4EW6T2TKXT0M";
    private static final String VNP_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

//    @PreAuthorize("hasRole('USER')")
    @PostMapping("/create")
    public ResponseEntity<PaymentCreateResponse> create(@RequestBody PaymentCreateRequest req) {

    String returnUrl = Optional.ofNullable(req.getReturnUrl())
        .orElse("http://localhost:3000/payment/result");

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", VNP_TMNCODE);
        params.put("vnp_Amount", String.valueOf(req.getAmount() * 100)); // VNPay yêu cầu nhân 100
        params.put("vnp_TxnRef", req.getOrderId());
        params.put("vnp_OrderInfo", "Thanh toan don hang " + req.getOrderId());
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_CurrCode", "VND");
    params.put("vnp_ReturnUrl", "http://localhost:9090/api/payment/vnpay/return");
//        params.put("vnp_IpnUrl", "http://localhost:8081/payment/vnpay/ipn"); //trả về inp

        params.put("vnp_IpAddr", Optional.ofNullable(req.getIpAddress()).orElse("127.0.0.1"));
        params.put("vnp_CreateDate", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));

        String query = VnpUtils.buildQuery(params);
        String secureHash = VnpUtils.hmacSHA512(VNP_HASHSECRET, query);
        System.out.println("Query: " + query);
        System.out.println("MyHash: " + secureHash);

        String paymentUrl = VNP_URL + "?" + query + "&vnp_SecureHash=" + secureHash;



        // Lưu transaction PENDING
        PaymentTransaction tx = new PaymentTransaction();
        tx.setOrderId(req.getOrderId());
        tx.setAmount(req.getAmount());
        tx.setStatus("PENDING");
        tx.setReturnUrl(returnUrl);
        repo.save(tx);

//        System.out.println("Query: " + query);
//        System.out.println("MyHash: " + secureHash);
        PaymentCreateResponse res = new PaymentCreateResponse();
        res.setPaymentUrl(paymentUrl);
        return ResponseEntity.ok(res);
    }
}


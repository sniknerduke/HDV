package com.hdv.payment;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Map;

@Controller //để redirect hoạt động
@RequestMapping("/payment/vnpay")
// @CrossOrigin(origins = "http://localhost:3000") // cho phép React gọi
public class VnpayReturnController {

    private final PaymentTransactionRepository repo;
    private static final String VNP_HASHSECRET = "5P56F0FIWJVCRBST3WQH4EW6T2TKXT0M";

    public VnpayReturnController(PaymentTransactionRepository repo) {
        this.repo = repo;

    }

    @GetMapping("/return")
    public String handleReturn(@RequestParam Map<String, String> params) {
        System.out.println("Params từ VNPay: " + params);

        // 1) Verify signature
        String secureHash = params.get("vnp_SecureHash");
        params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        String hashData = VnpUtils.buildQuery(params);   // cần sắp xếp key tăng dần, join "key=value" bằng '&'
//        System.out.println(hashData);
        String myHash = VnpUtils.hmacSHA512(VNP_HASHSECRET, hashData);
        if (!myHash.equalsIgnoreCase(secureHash)) {
            // Chối nhận và đưa người dùng về trang lỗi chung
            return "redirect:http://localhost:8080/payment-failed?reason=checksum";
        }

        // 2) Extract params
        String orderId = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String transactionNo = params.get("vnp_TransactionNo");
        long amount = Long.parseLong(params.getOrDefault("vnp_Amount", "0")) / 100;

        // 3) Save transaction
        PaymentTransaction tx = repo.findByOrderId(orderId).orElseGet(PaymentTransaction::new);
        tx.setOrderId(orderId);
        tx.setVnpResponseCode(responseCode);
        tx.setVnpTransactionNo(transactionNo);
        tx.setAmount(amount);
        tx.setStatus("00".equals(responseCode) ? "SUCCESS" : "FAILED");
        tx.setUpdatedAt(LocalDateTime.now());
        repo.save(tx);

        // 4) Optional: backend-to-backend sync to 8080
        try {
            RestTemplate restTemplate = new RestTemplate();
            Map<String, Object> payload = Map.of(
                    "orderId", orderId,
                    "amount", amount,
                    "status", tx.getStatus(),
                    "vnpTransactionNo", transactionNo,
                    "vnpResponseCode", responseCode
            );
//            restTemplate.postForObject("http://localhost:8080/api/orders/update-status", payload, String.class);
            restTemplate.postForObject("http://localhost:8080/payment/callback/vnpay", payload, String.class);
        } catch (Exception e) {
            e.printStackTrace(); // không chặn redirect nếu sync lỗi
        }

        // 5) Redirect back to Checkout page (Vite dev server)
        String baseFrontend = "http://localhost:3000"; // adjust if deployed
        if ("SUCCESS".equals(tx.getStatus())) {
            return "redirect:" + baseFrontend + "/checkout?payment=success&orderId=" + orderId + "&amount=" + amount;
        } else {
            return "redirect:" + baseFrontend + "/checkout?payment=failed&orderId=" + orderId + "&code=" + responseCode;
        }
    }
}


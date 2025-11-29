package com.hdv.payment;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class OrderCallbackService {

    private final RestTemplate restTemplate = new RestTemplate();

    public void updateOrderStatus(String orderId, String status) {
//        String url = "http://localhost:8080/api/orders/update-status";
        String url = "http://localhost:8080/payment/callback/vnpay";

        // payload gửi sang Main Project
        OrderStatusUpdateRequest request = new OrderStatusUpdateRequest(orderId, status);

        restTemplate.postForObject(url, request, String.class);
    }
}


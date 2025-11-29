package com.example.onlineCourses.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class VNPayRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderId;
    private long amount;
    private String orderInfo;
    private String returnUrl;
    private String ipnUrl;

    // Constructors
    public VNPayRequest() {}

    public VNPayRequest(String orderId, long amount, String orderInfo, String returnUrl, String ipnUrl) {
        this.orderId = orderId;
        this.amount = amount;
        this.orderInfo = orderInfo;
        this.returnUrl = returnUrl;
        this.ipnUrl = ipnUrl;
    }

    // Getters and Setters
    public String getOrderId() {
        return orderId;
    }
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public long getAmount() {
        return amount;
    }
    public void setAmount(long amount) {
        this.amount = amount;
    }

    public String getOrderInfo() {
        return orderInfo;
    }
    public void setOrderInfo(String orderInfo) {
        this.orderInfo = orderInfo;
    }

    public String getReturnUrl() {
        return returnUrl;
    }
    public void setReturnUrl(String returnUrl) {
        this.returnUrl = returnUrl;
    }

    public String getIpnUrl() {
        return ipnUrl;
    }
    public void setIpnUrl(String ipnUrl) {
        this.ipnUrl = ipnUrl;
    }
}

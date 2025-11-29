package com.hdv.payment;

public class PaymentCreateRequest {
    private String orderId;
    private Long amount;      // VND
    private String returnUrl; // URL frontend của Main Project để hiển thị kết quả
    private String ipAddress; // IP client (optional)
    // getters/setters...

    public String getOrderId() {
        return orderId;

    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public Long getAmount() {
        return amount;
    }

    public void setAmount(Long amount) {
        this.amount = amount;
    }

    public String getReturnUrl() {
        return returnUrl;
    }

    public void setReturnUrl(String returnUrl) {
        this.returnUrl = returnUrl;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
}



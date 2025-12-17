package com.example.onlineCourses.DTO;

import java.util.List;

public record CartResponse(
        List<CartItemDTO> items,
        long totalPrice,
        int itemCount

) {
//    @Override
//    public List<CartItemDTO> items() {
//        return items;
//    }
//
//    @Override
//    public int totalPrice() {
//        return totalPrice;
//    }
}


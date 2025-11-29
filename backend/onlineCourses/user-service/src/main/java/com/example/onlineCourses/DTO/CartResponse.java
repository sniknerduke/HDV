package com.example.onlineCourses.DTO;

import java.util.List;

public record CartResponse(
        List<CartItemDTO> items,
        int totalPrice

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


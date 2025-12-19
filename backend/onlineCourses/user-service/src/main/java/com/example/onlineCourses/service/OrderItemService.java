package com.example.onlineCourses.service;

import com.example.onlineCourses.DTO.OrderItemDTO;
import com.example.onlineCourses.model.OrderItem;
import com.example.onlineCourses.repository.OrderItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderItemService {

    private final OrderItemRepository orderItemRepository;

    public OrderItemService(OrderItemRepository orderItemRepository) {
        this.orderItemRepository = orderItemRepository;
    }

    public List<OrderItemDTO> getOrderItemsByOrderId(Long orderId) {
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        return items.stream()
                .map(i -> new OrderItemDTO(
                        i.getId(),
                        i.getOrder().getId(),
                        i.getCourseId(),
                        i.getCourseName(),
                        i.getPrice()
                ))
                .collect(Collectors.toList());
    }
}


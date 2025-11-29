package com.example.onlineCourses.service;

import com.example.onlineCourses.DTO.CartItemDTO;
import com.example.onlineCourses.DTO.CartResponse;
import com.example.onlineCourses.DTO.CourseDTO;
import com.example.onlineCourses.clients.CourseClient;
import com.example.onlineCourses.model.CartItem;
import com.example.onlineCourses.model.Order;
import com.example.onlineCourses.model.User;
import com.example.onlineCourses.repository.CartItemRepository;
import com.example.onlineCourses.repository.OrderRepository;
import com.example.onlineCourses.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;
    @Autowired
    private CourseClient courseClient;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

//    private final RestTemplate restTemplate;

    public CartService(CartItemRepository cartItemRepository,
                       UserRepository userRepository,
                       OrderRepository orderRepository,
                       CourseClient courseClient) {
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.courseClient = courseClient;
    }

//    public CartService(RestTemplateBuilder builder) {
//        this.restTemplate = builder.build();
//    }

    public CartResponse getCart(Long userId) {
        // 1. Lấy toàn bộ item trong giỏ
        List<CartItem> items = cartItemRepository.findByUserId(userId);
        int total = 0;
        List<CartItemDTO> itemDtos = new ArrayList<>();

        // 2. Với mỗi item → gọi CourseService lấy giá/title
        for (CartItem item : items) {

            CourseDTO course = courseClient.getCourseById(item.getCourseId());

            // 3. Build CartItemDto
            CartItemDTO dto = new CartItemDTO(
                    item.getId(),
                    item.getCourseId(),
                    course.title(),
                    course.price()
            );

            itemDtos.add(dto);
            total += course.price() ;
        }

        // 5. Trả ra FE
        return new CartResponse(itemDtos, total);
    }

    public void addToCart(Long userId, Long courseId) {

        // Kiểm tra cart item đã tồn tại?
        Optional<CartItem> existed =
                cartItemRepository.findByUserIdAndCourseId(userId, courseId);

        if (existed.isPresent()) {
            CartItem item = existed.get();
//            item.setQuantity(item.getQuantity() + quantity);
            cartItemRepository.save(item);
            return;
        }

        // Chưa có → thêm mới
        CartItem newItem = new CartItem();
        newItem.setUserId(userId);
        newItem.setCourseId(courseId);
//        newItem.setQuantity(quantity);

        cartItemRepository.save(newItem);
    }

    public void removeItem(Long courseId, Long userId) {
        CartItem item = cartItemRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        cartItemRepository.delete(item);
    }

    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }

    public Order checkout(Long userId) {
        // 1. Lấy user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // 2. Lấy giỏ hàng user
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Giỏ hàng đang trống");
        }

        // 3. Tính tổng tiền (gọi qua CourseService)
        long totalAmount = 0;

        for (CartItem item : cartItems) {
            if (item.getCourseId() == null) continue;
            CourseDTO course = courseClient.getCourseById(item.getCourseId());
            if (course == null) {
                throw new RuntimeException("Course not found: " + item.getCourseId());
            }
            totalAmount += course.price();
        }

        // 4. Tạo order
        Order order = new Order();
        order.setUserId(user.getId());
        order.setAmount(totalAmount);
        order.setStatus("PENDING");
        orderRepository.save(order);

        // 5. Clear giỏ hàng
        cartItemRepository.deleteAll(cartItems);

        return order;
    }

    public long calculateTotal(Long userId) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);

        long total = 0;

        for (CartItem item : cartItems) {
            CourseDTO course = courseClient.getCourseById(item.getCourseId());
            total += (long) course.price() ;
        }

        return total;
    }


//    public CartItemDTO toDTO(CartItem item) {
//        String url = "http://localhost:8082/api/courses/" + item.getCourseId();
//        CourseDTO courseDTO = restTemplate.getForObject(url, CourseDTO.class);
//
//        CartItemDTO dto = new CartItemDTO();
//        dto.setId(item.getId());
//        dto.setQuantity(item.getQuantity());
//        dto.setCourseId(item.getCourseId());
//        dto.setPrice(item.getPrice());
//        dto.setCourse(courseDTO);
//        return dto;
//    }

//    public List<CartItemDTO> getCartItems(Long userId) {
////        User user = userRepository.findById(userId)
////                .orElseThrow(() -> new RuntimeException("User not found"));
////        List<CartItem> items = cartItemRepository.findByUser(user);
////        return items.stream().map(this::toDTO).toList();
//        List<CartItem> items = cartItemRepository.findByUserId(userId);
//        List<Long> ids = items.stream().map(CartItem::getCourseId).toList();
//
//        // gọi sang course service một lần
//        String url = "http://localhost:8081/api/courses/batch";
//        List<CourseDTO> courses = restTemplate.postForObject(url, ids, List.class);
//
//        // map courseId -> CourseDTO
//        Map<Long, CourseDTO> courseMap = courses.stream()
//                .collect(Collectors.toMap(CourseDTO::getId, c -> c));
//
//        return items.stream().map(item -> {
//            CartItemDTO dto = new CartItemDTO();
//            dto.setId(item.getId());
//            dto.setQuantity(item.getQuantity());
//            dto.setCourse(courseMap.get(item.getCourseId()));
//            return dto;
//        }).toList();}




}


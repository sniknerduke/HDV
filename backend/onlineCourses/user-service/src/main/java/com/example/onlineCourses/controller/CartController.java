package com.example.onlineCourses.controller;

import com.example.onlineCourses.DTO.CartItemDTO;
import com.example.onlineCourses.DTO.CartResponse;
import com.example.onlineCourses.model.CartItem;
import com.example.onlineCourses.model.Order;
import com.example.onlineCourses.service.CartService;
import com.example.onlineCourses.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
//@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserService userService;
    @Autowired
    private com.example.onlineCourses.repository.CartItemRepository cartItemRepository;

    // Lấy toàn bộ giỏ hàng của user (items + tổng tiền)
    @GetMapping
    public ResponseEntity<CartResponse> getCart(
            @RequestHeader("X-User-Id") Long userId
    ) {
        CartResponse response = cartService.getCart(userId);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('USER')")
//    @PostMapping("/add-to-cart/{courseId}")
//    public ResponseEntity<CartItem> addToCart(
//            @PathVariable Long courseId,
//            @RequestHeader("X-User-Id") Long userId
//    ) {
//        CartItem item = cartService.addToCart(userId, courseId);
////        return ResponseEntity.ok(Map.of("message", "Added", "userId", userId, "courseId", courseId));
//        return ResponseEntity.ok(item);
//    }
    @PostMapping("/add-to-cart/{courseId}")
    public ResponseEntity<?> addToCart(
            @PathVariable Long courseId,
            @RequestHeader("X-User-Id") Long userId
    ) {
        try {
            CartItem item = cartService.addToCart(userId, courseId);
            return ResponseEntity.ok(item);
        } catch (IllegalArgumentException e) {
            // ví dụ: courseId không tồn tại
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid courseId",
                    "message", e.getMessage()
            ));
        } catch (RuntimeException e) {
            // các lỗi khác
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Server error",
                    "message", e.getMessage()
            ));
        }
    }


//    @PreAuthorize("hasRole('USER')")
    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<?> removeItem(
            @PathVariable Long cartItemId,
            @RequestHeader("X-User-Id") Long userId
    ) {

        cartService.removeItem(cartItemId);
        return ResponseEntity.ok("Removed");
    }


//    @PreAuthorize("hasRole('USER')")
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(@RequestParam Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok("Cleared");
    }


    @PreAuthorize("hasRole('USER')")
    @GetMapping("/total")
    public long getTotal(@RequestParam Long userId) {
        return cartService.calculateTotal(userId);
    }


//    @PostMapping("/increase/{cartItemId}")
//    public void increase(@PathVariable Long cartItemId) {
//        cartService.increase(cartItemId);
//    }

//    @PostMapping("/decrease/{cartItemId}")
//    public void decrease(@PathVariable Long cartItemId) {
//        cartService.decrease(cartItemId);
//    }


    @DeleteMapping("/remove-from-cart")
//    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> removeCourseFromCart(@RequestParam Long userId, @RequestParam Long courseId) {
        //lấy id từ token

        Optional<CartItem> item = cartItemRepository.findByUserIdAndCourseId(userId, courseId);
        if (item.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy item trong giỏ hàng");
        }

        cartItemRepository.delete(item.get());
        return ResponseEntity.ok("Course removed");
    }





}


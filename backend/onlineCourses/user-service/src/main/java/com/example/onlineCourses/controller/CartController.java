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
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserService userService;
    @Autowired
    private com.example.onlineCourses.repository.CartItemRepository cartItemRepository;

    // Lấy toàn bộ giỏ hàng của user (items + tổng tiền)
    @GetMapping
    public ResponseEntity<CartResponse> getCart(@RequestParam Long userId) {
        CartResponse response = cartService.getCart(userId);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/add-to-cart")
    public ResponseEntity<?> addToCart(
            @RequestParam Long userId,
            @RequestParam Long courseId
    ) {

        cartService.addToCart(userId, courseId);
        return ResponseEntity.ok("Added");
    }

    @PreAuthorize("hasRole('USER')")
    @DeleteMapping("/{courseId}")
    public ResponseEntity<?> removeItem(
            @PathVariable Long courseId,
            @RequestParam Long userId) {

        cartService.removeItem(courseId, userId);
        return ResponseEntity.ok("Removed");
    }

    @PreAuthorize("hasRole('USER')")
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(@RequestParam Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok("Cleared");
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/checkout")
    public Order checkout(@RequestParam Long userId) {
        return cartService.checkout(userId);
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
//    @GetMapping
//    @PreAuthorize("hasRole('USER')")
//    public ResponseEntity<List<CartItemDTO>> getCart() {
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        String username = auth.getName();
//        Long userId = userService.findIdByUsername(username);
//        return ResponseEntity.ok(cartService.getCartItems(userId));
//    }

//    @PostMapping("/add-to-cart")
//    @PreAuthorize("hasRole('USER')")
//    public ResponseEntity<String> addCourseToCart(@RequestParam Long userId, @RequestParam Long courseId) {
//        cartService.addCourseToCart(userId, courseId);
//        return ResponseEntity.ok("Course added to cart");
//    }
//
//    @DeleteMapping("/remove-from-cart")
//    @PreAuthorize("hasRole('USER')")
//    public ResponseEntity<String> removeCourseFromCart(@RequestParam Long userId, @RequestParam Long courseId) {
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        System.out.println("Auth: " + auth);
//        cartService.removeCourseFromCart(userId, courseId);
//        return ResponseEntity.ok("Course removed from cart");
//    }

    @DeleteMapping("/remove-from-cart")
//    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> removeCourseFromCart(@RequestParam Long userId, @RequestParam Long courseId) {
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        String username = auth.getName();
//        Long userId = userService.findIdByUsername(username);
        //lấy id từ token

        Optional<CartItem> item = cartItemRepository.findByUserIdAndCourseId(userId, courseId);
        if (item.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy item trong giỏ hàng");
        }

        cartItemRepository.delete(item.get());
        return ResponseEntity.ok("Course removed");
//        Optional<CartItem> item = cartItemRepository.findByUserIdAndCourseId(userId, courseId);
//        if (item.isEmpty()) {
//            throw new IllegalArgumentException("Không tìm thấy item trong giỏ hàng");
//        }
//        cartItemRepository.delete(item.get());
//        try {
////            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
////            String username = auth.getName();
////            Long userId = userService.findIdByUsername(username); // lấy userId từ username trong token
//            cartService.removeCourseFromCart(userId, courseId);
//            // logic xóa
//            return ResponseEntity.ok("Course removed");
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Xóa thất bại: " + e.getMessage());
//        }
    }

//    @PostMapping("/add-to-cart")
//    @PreAuthorize("hasRole('USER')")
//    public ResponseEntity<String> addCourseToCart(@RequestParam Long courseId) {
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        System.out.println("Auth: " + auth);
//
////        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        String username = auth.getName();
//        Long userId = userService.findIdByUsername(username);
//        cartService.addCourseToCart(userId, courseId);
//        return ResponseEntity.ok("Course added to cart");
//    }


//    @DeleteMapping("/clear")
//    @PreAuthorize("hasRole('USER')")
//    public ResponseEntity<String> clearCart(@RequestParam Long userId) {
//        cartService.clearCart(userId);
//        return ResponseEntity.ok("Cart cleared");
//    }

//    @PostMapping("/checkout")
//    @PreAuthorize("hasRole('USER')")
////    public ResponseEntity<Order> checkout(@RequestParam Long userId) {
//    public ResponseEntity<Order> checkout() {
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        String username = auth.getName();
//        Long userId = userService.findIdByUsername(username);
//        Order order = cartService.checkout(userId);
//        return ResponseEntity.ok(order);
//    }

//    @GetMapping("/total")
//    public ResponseEntity<Long> getCartTotal(@RequestParam Long userId) {
//        return ResponseEntity.ok(cartService.getCartTotal(userId));
//    }


}


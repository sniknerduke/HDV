package com.example.onlineCourses.controller;

import com.example.onlineCourses.DTO.OrderStatusUpdateRequest;
import com.example.onlineCourses.model.CartItem;
import com.example.onlineCourses.model.Order;
import com.example.onlineCourses.repository.OrderItemRepository;
import com.example.onlineCourses.repository.OrderRepository;
import com.example.onlineCourses.service.CartService;
import com.example.onlineCourses.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import jakarta.servlet.http.HttpServletResponse;
@RestController
@RequestMapping("/api/orders")
//@CrossOrigin(origins = "http://localhost:3000") // cho phép React gọi
public class OrderController {

    private final OrderRepository orderRepo;
    private final CartService cartService;
    private final OrderService orderService;


    public OrderController(OrderRepository orderRepo, CartService cartService, OrderService orderService) {
        this.orderRepo = orderRepo;
        this.cartService = cartService;
        this.orderService = orderService;
    }


    @GetMapping("/export")
    public void exportOrdersToExcel(HttpServletResponse response) throws IOException {
        // Thiết lập header để trình duyệt hiểu là file Excel
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=orders.xlsx");

        // Tạo workbook và sheet
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Orders");

        // Header row
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("ID");
        header.createCell(0).setCellValue("Order ID");
        header.createCell(1).setCellValue("User ID");
        header.createCell(2).setCellValue("Amount");
        header.createCell(3).setCellValue("Status");
        header.createCell(4).setCellValue("Created At");

        // Lấy dữ liệu từ DB
        List<Order> orders = orderRepo.findAll(Sort.by("createdAt").descending());

        int rowIdx = 1;
        for (Order order : orders) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(order.getId());
            row.createCell(1).setCellValue(order.getOrderId());
            row.createCell(2).setCellValue(order.getUserId());
            row.createCell(3).setCellValue(order.getAmount());
            row.createCell(4).setCellValue(order.getStatus());
            row.createCell(5).setCellValue(order.getCreatedAt().toString());
        }

        // Ghi ra response output stream
        workbook.write(response.getOutputStream());
        workbook.close();
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchOrders(
            @RequestParam String type,
            @RequestParam Long value) {

        switch (type) {
            case "orderId":
                Order order = orderService.getOrderById(value);
                return ResponseEntity.ok(order);

            case "userId":
                List<Order> orders = orderService.getOrdersByUserId(value);
                return ResponseEntity.ok(orders);

            default:
                return ResponseEntity.badRequest().body("Loại tìm kiếm không hợp lệ");
        }
    }


//    @GetMapping("/search")
//    public ResponseEntity<?> searchOrders(
//
//            @RequestParam(required = false) Long id,
//            @RequestParam(required = false) Long userId) {
//
//        if (id != null) {
//            Order order = orderService.getOrderById(id);
//            return ResponseEntity.ok(order);
//        } else if (userId != null) {
//            List<Order> orders = orderService.getOrdersByUserId(userId);
//            return ResponseEntity.ok(orders);
//        }
//        return ResponseEntity.badRequest().body("Phải truyền id hoặc userId");
//    }

    @GetMapping("/id/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

//    @GetMapping("/id/{id}")
//    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
//        try {
//            Order order = orderService.getOrderById(id);
//            if (order == null) {
//                // Không tìm thấy order
//                return ResponseEntity.status(HttpStatus.NOT_FOUND)
//                        .body("Order with id " + id + " not found");
//            }
//            return ResponseEntity.ok(order);
//        } catch (IllegalArgumentException ex) {
//            // Ví dụ service ném lỗi khi id không hợp lệ
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body("Invalid order id: " + id);
//        } catch (Exception ex) {
//            // Bắt các lỗi khác
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("Error retrieving order: " + ex.getMessage());
//        }
//    }


    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderByOrderId(@PathVariable String orderId) {
        return orderRepo.findByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

//    @PreAuthorize("hasRole('USER')")
    @PostMapping("/checkout")
    public ResponseEntity<Order> checkout(
            @RequestHeader("X-User-Id") Long userId
    ) {
        try {
            Order order = orderService.checkout(userId);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    //    @PreAuthorize("hasRole('USER')")
    @PostMapping("/update-status")
//    public ResponseEntity<Void> updateStatus(@RequestBody Map<String, Object> payload, @RequestHeader Map<String, String> headers) {
    public ResponseEntity<Void> updateStatus(@RequestBody OrderStatusUpdateRequest request) {
        orderService.updateStatus(request.getOrderId(), request.getStatus());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    //chưa sửa
//    @GetMapping
//    public List<Order> getAllOrders() {
//        return orderRepo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
//    }
    @GetMapping
    public Page<Order> getAllOrders(@RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "10") int size) {
        return orderRepo.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }


    // DEBUG: Kiểm tra trạng thái orders trong database
    @GetMapping("/debug-status")
    public Map<String, Object> debugOrderStatus() {
        List<Order> allOrders = orderRepo.findAll();
        long successCount = allOrders.stream().filter(o -> "SUCCESS".equals(o.getStatus())).count();
        long paidCount = allOrders.stream().filter(o -> "PAID".equals(o.getStatus())).count();
        long pendingCount = allOrders.stream().filter(o -> "PENDING".equals(o.getStatus())).count();
        
        return Map.of(
            "totalOrders", allOrders.size(),
            "SUCCESS", successCount,
            "PAID", paidCount,
            "PENDING", pendingCount,
            "allStatuses", allOrders.stream().map(o -> o.getOrderId() + ": " + o.getStatus()).toList()
        );
    }

    @GetMapping("/status")
    public List<Order> getOrders(@RequestParam(required = false) String status) {
        if (status != null) {
            return orderRepo.findByStatusOrderByCreatedAtDesc(status);
        }
        return orderRepo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

//    @GetMapping("/filter")
//    public List<Order> filterOrders(@RequestParam String start, @RequestParam String end) {
//        LocalDateTime s = LocalDateTime.parse(start);
//        LocalDateTime e = LocalDateTime.parse(end);
//        return orderRepo.findByCreatedAtBetweenOrderByCreatedAtDesc(s, e);
//    }
    @GetMapping("/filter")
    public List<Order> filterOrders(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(required = false) String status) {

        if (status != null) {
            return orderRepo.findByStatusAndCreatedAtBetweenOrderByCreatedAtDesc(status, start, end);
        }
        return orderRepo.findByCreatedAtBetweenOrderByCreatedAtDesc(start, end);
    }


    // dùng để thống kê
    @Autowired // Hoặc thêm vào constructor
    private OrderItemRepository orderItemRepository;
    // Thêm API này để Service_thongke gọi
    @GetMapping("/internal/stats")
    public List<com.example.onlineCourses.DTO.SalesSummaryDTO> getSalesStats(
            @RequestParam("start") String start, // Dạng String ISO hoặc format tùy ý
            @RequestParam("end") String end) {

        // Convert String sang LocalDateTime (Giả sử client gửi yyyy-MM-ddTHH:mm:ss)
        LocalDateTime startDate = LocalDateTime.parse(start);
        LocalDateTime endDate = LocalDateTime.parse(end);
        
        // DEBUG: Log thông tin để kiểm tra
        System.out.println("=== DEBUG STATS ===");
        System.out.println("Start: " + startDate);
        System.out.println("End: " + endDate);
        
        List<com.example.onlineCourses.DTO.SalesSummaryDTO> result = orderItemRepository.findSalesStatistics(startDate, endDate);
        System.out.println("Result count: " + result.size());
        result.forEach(r -> System.out.println("  - " + r.getCourseName() + ": " + r.getTotalSold() + " sold, " + r.getTotalRevenue() + " revenue"));
        System.out.println("===================");
        
        return result;
    }
    // hết

}

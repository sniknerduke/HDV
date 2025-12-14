package com.servicethongke.servicethongke.controller;

import com.servicethongke.servicethongke.dto.reponse.SaleResponse;
import com.servicethongke.servicethongke.dto.request.SaleRequest;
import com.servicethongke.servicethongke.service.SaleService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SaleController {
    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    // Thêm lượt bán
    @PostMapping
    public ResponseEntity<SaleResponse> createSale(@RequestBody @Valid SaleRequest request) {
        return ResponseEntity.ok(saleService.createSale(request));
    }

    // Xem tất cả
    @GetMapping
    public ResponseEntity<List<SaleResponse>> getAllSales() {
        return ResponseEntity.ok(saleService.getAllSales());
    }

    // Sửa lượt bán
    @PutMapping("/{id}")
    public ResponseEntity<SaleResponse> updateSale(@PathVariable Long id, @RequestBody SaleRequest request) {
        return ResponseEntity.ok(saleService.updateSale(id, request));
    }

    // Xóa lượt bán
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSale(@PathVariable Long id) {
        saleService.deleteSale(id);
        return ResponseEntity.ok("Đã xóa lượt bán ID: " + id);
    }
}

package com.servicethongke.servicethongke.controller;

import com.servicethongke.servicethongke.dto.reponse.SalesStatisticResponse;
import com.servicethongke.servicethongke.dto.request.TimeRangeRequest;
import com.servicethongke.servicethongke.service.SalesStatisticService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
//import org.springframework.web.bind.annotation.CrossOrigin;
import java.util.stream.Collectors; // <-- THÊM: Cần để xử lý ánh xạ (map) dữ liệu
@RestController
@RequestMapping("/api/statistics")

// --- CORS được xử lý bởi API Gateway, không cần @CrossOrigin ở đây ---
// @CrossOrigin(origins = "*", maxAge = 3600)
public class SalesStatisticController {
    private final SalesStatisticService salesStatisticService;

    // Inject Service vào Controller
    public SalesStatisticController(SalesStatisticService salesStatisticService) {
        this.salesStatisticService = salesStatisticService;
    }

    /**
     * API Thống kê doanh thu.
     * URL đầy đủ: http://localhost:8080/servicethongke/api/statistics/sales
     */

    /**
     * URL API thực tế: http://localhost:8084/api/statistics/sales
     * Gateway (9090) sẽ gọi vào đây.
     */
    @PostMapping("/sales")
    public ResponseEntity<List<SalesStatisticResponse>> getSalesStatistics(
            @RequestBody @Valid TimeRangeRequest request) {

        // Gọi xuống tầng Service để xử lý logic
        List<SalesStatisticResponse> result = salesStatisticService.getSalesStatistics(request);
        // Trả kết quả về cho client
        return ResponseEntity.ok(result);
    }

}

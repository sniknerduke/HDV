package com.edu.statistic.controller;

import com.edu.statistic.client.UserServiceClient;
import com.edu.statistic.dto.SalesStatisticResponse;
import com.edu.statistic.dto.TimeRangeRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    private static final Logger log = LoggerFactory.getLogger(StatisticsController.class);
    private final UserServiceClient userServiceClient;

    public StatisticsController(UserServiceClient userServiceClient) {
        this.userServiceClient = userServiceClient;
    }

    /**
     * POST /api/statistics/sales
     * Body: { "start": "yyyy-MM-dd", "end": "yyyy-MM-dd" }
     *
     * Proxies the request to user-service's internal stats endpoint.
     */
    @PostMapping("/sales")
    public ResponseEntity<List<SalesStatisticResponse>> getSalesStatistics(
            @RequestBody @Valid TimeRangeRequest request) {

        // Convert LocalDate → LocalDateTime string for user-service
        DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        String startStr = request.getStart().atStartOfDay().format(fmt);
        String endStr = request.getEnd().atTime(LocalTime.MAX).format(fmt);

        log.debug("Fetching sales statistics: {} → {}", startStr, endStr);

        List<SalesStatisticResponse> result = userServiceClient.getSalesStats(startStr, endStr);
        return ResponseEntity.ok(result);
    }
}

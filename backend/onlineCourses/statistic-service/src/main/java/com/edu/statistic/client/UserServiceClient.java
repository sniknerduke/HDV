package com.edu.statistic.client;

import com.edu.statistic.dto.SalesStatisticResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

/**
 * Feign client that calls user-service to fetch sales statistics.
 * <p>
 * - In Docker (Eureka available): resolves "onlineCourses" via service discovery.
 * - Locally (no Eureka): falls back to ${user-service.url} from application.properties.
 */
@FeignClient(
        name = "onlineCourses",
        url = "${user-service.url:}",
        path = "/api/orders/internal"
)
public interface UserServiceClient {

    @GetMapping("/stats")
    List<SalesStatisticResponse> getSalesStats(
            @RequestParam("start") String start,
            @RequestParam("end") String end
    );
}

package com.servicethongke.servicethongke.client;

import com.servicethongke.servicethongke.dto.reponse.SalesStatisticResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.List;

// name = "user-service" phải khớp với spring.application.name trong file properties của user-service
@FeignClient(name = "user-service", url = "http://localhost:8080") // url là tạm thời nếu chưa chạy Eureka, nếu chạy Eureka thì bỏ url đi
public interface UserClient {

    @GetMapping("/api/orders/internal/stats")
    List<SalesStatisticResponse> getSalesStats(@RequestParam("start") String start,
                                               @RequestParam("end") String end);
}
package com.servicethongke.servicethongke.service;


import com.servicethongke.servicethongke.client.UserClient;
import com.servicethongke.servicethongke.dto.reponse.SalesStatisticResponse;
import com.servicethongke.servicethongke.dto.request.TimeRangeRequest;
import com.servicethongke.servicethongke.repository.CourseSalesProjection;
import com.servicethongke.servicethongke.repository.SaleRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class SalesStatisticServiceImpl implements SalesStatisticService {
//    private final SaleRepository saleRepository;
//    private final SalesStatisticMapper mapper;
//
//    public SalesStatisticServiceImpl(SaleRepository saleRepository,
//                                     SalesStatisticMapper mapper) {
//        this.saleRepository = saleRepository;
//        this.mapper = mapper;
//    }
//
//
//    public List<SalesStatisticResponse> getSalesStatistics(TimeRangeRequest request) {
//
//        // Gọi repository lấy raw data từ database
//        List<CourseSalesProjection> results =
//                saleRepository.findSalesByCourseBetween(request.getStart(), request.getEnd());
//
//        // Convert Projection → Response DTO
//        return results.stream()
//                .map(mapper::toResponse)
//                .toList();
//    }
private final UserClient userClient;

    // Bỏ SaleRepository, Bỏ Mapper (vì user-service đã trả về DTO chuẩn rồi)
    public SalesStatisticServiceImpl(UserClient userClient) {
        this.userClient = userClient;
    }

    @Override
    public List<SalesStatisticResponse> getSalesStatistics(TimeRangeRequest request) {
        // BƯỚC 1: Chuyển LocalDate (chỉ ngày) sang LocalDateTime (ngày + giờ)
        // Ví dụ: nhập 2024-01-01 -> thành 2024-01-01T00:00:00
        LocalDateTime startDateTime = request.getStart().atStartOfDay();

        // Ví dụ: nhập 2024-12-31 -> thành 2024-12-31T23:59:59.999999999
        LocalDateTime endDateTime = request.getEnd().atTime(LocalTime.MAX);

        // BƯỚC 2: Format sang String chuẩn ISO để gửi qua API User-Service
        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        String startStr = startDateTime.format(formatter);
        String endStr = endDateTime.format(formatter);

        // BƯỚC 3: Gọi sang User-Service
        return userClient.getSalesStats(startStr, endStr);
    }
}

package com.servicethongke.servicethongke.service;

import com.servicethongke.servicethongke.dto.reponse.SalesStatisticResponse;
import com.servicethongke.servicethongke.repository.CourseSalesProjection;
import com.servicethongke.servicethongke.repository.SalesStatisticProjection;
import org.springframework.stereotype.Component;

@Component
public class SalesStatisticMapper {

    /**
     * Chuyển dữ liệu từ CourseSalesProjection → SalesStatisticResponse.
     * Convert dữ liệu từ Projection (DB trả về)
     * sang Response DTO trả về cho client.
     */
    // Đổi tham số từ SalesStatisticProjection thành CourseSalesProjection
    public SalesStatisticResponse toResponse(CourseSalesProjection p) {
        SalesStatisticResponse resp = new SalesStatisticResponse();

        resp.setCourseId(p.getCourseId());

        // Sửa p.getCourseCode() -> p.getCode() (theo CourseSalesProjection)
        //resp.setCourseCode(p.getCode());

        // Sửa p.getCourseTitle() -> p.getTitle() (theo CourseSalesProjection)
        resp.setCourseName(p.getTitle());

        resp.setTotalSold(p.getTotalSold());
        //resp.setTotalRevenue(p.getTotalRevenue());

        return resp;
    }
}

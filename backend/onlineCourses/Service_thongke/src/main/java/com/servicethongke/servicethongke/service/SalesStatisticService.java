package com.servicethongke.servicethongke.service;

import com.servicethongke.servicethongke.dto.reponse.SalesStatisticResponse;
import com.servicethongke.servicethongke.dto.request.TimeRangeRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface SalesStatisticService {
    /**
     * Thống kê số lượt bán của tất cả khóa học trong khoảng thời gian.
     *
     * @param request chứa startDate và endDate
     * @return danh sách thống kê mỗi khóa học (courseTitle + totalSold)
     */
    List<SalesStatisticResponse> getSalesStatistics(TimeRangeRequest request);
}

package com.edu.statistic.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SalesStatisticResponse {

    private Long courseId;
    private String courseName;
    private Long totalSold;
    private Long totalRevenue;
}

package com.edu.statistic.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TimeRangeRequest {

    @NotNull(message = "start is required (format: yyyy-MM-dd)")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate start;

    @NotNull(message = "end is required (format: yyyy-MM-dd)")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate end;
}

package com.servicethongke.servicethongke.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;
@Getter
@Setter


@TimeRangeValid // custom class-level validator (được định nghĩa bên dưới)
public class TimeRangeRequest {
    @NotNull(message = "start không được để trống (format: yyyy-MM-dd")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate start;

    @NotNull(message = "end không được để trống (format: yyyy-MM-dd")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate end;

    // Constructor không tham số cần cho Jackson
    public TimeRangeRequest() {}

    public TimeRangeRequest(LocalDate start, LocalDate end) {
        this.start = start;
        this.end = end;
    }

}

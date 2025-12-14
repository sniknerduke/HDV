package com.servicethongke.servicethongke.dto.request;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Validator: kiểm tra start, end có null không (được @NotNull kiểm rồi),
 * và kiểm tra start <= end.
 */
public class TimeRangeValidator implements ConstraintValidator<TimeRangeValid, TimeRangeRequest> {
    @Override
    public boolean isValid(TimeRangeRequest value, ConstraintValidatorContext context) {
        if (value == null) return true; // @NotNull ở trường xử lý null riêng

        LocalDate start = value.getStart();
        LocalDate end = value.getEnd();

        // Nếu one of them null, để @NotNull báo lỗi — ở đây trả true để tránh duplicate message
        if (start == null || end == null) {
            return true;
        }
        // Valid nếu start <= end
        return !start.isAfter(end);
    }


}

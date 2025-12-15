package com.servicethongke.servicethongke.dto.request;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Annotation dùng để kiểm tra TimeRangeRequest: start <= end
 */
@Documented
@Constraint(validatedBy = TimeRangeValidator.class)
@Target({ ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
public @interface  TimeRangeValid {
    String message() default "start phải nhỏ hơn hoặc bằng end";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

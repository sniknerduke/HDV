package com.servicethongke.servicethongke.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CourseRequest {
    @NotBlank(message = "Mã khóa học không được để trống")
    private String code;

    @NotBlank(message = "Tên khóa học không được để trống")
    private String title;
}

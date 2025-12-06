package com.example.onlineCourses.dto;

import jakarta.validation.constraints.NotNull;

public class ReorderRequest {
    @NotNull
    private Integer fromIndex;
    @NotNull
    private Integer toIndex;

    public Integer getFromIndex() { return fromIndex; }
    public void setFromIndex(Integer fromIndex) { this.fromIndex = fromIndex; }
    public Integer getToIndex() { return toIndex; }
    public void setToIndex(Integer toIndex) { this.toIndex = toIndex; }
}
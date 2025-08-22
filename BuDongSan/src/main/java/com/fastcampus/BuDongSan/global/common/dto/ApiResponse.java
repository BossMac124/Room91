package com.fastcampus.BuDongSan.global.common.dto;

public record ApiResponse<T>(boolean success, T data, String message) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, null);
    }
    public static <T> ApiResponse<T> ok(T data, String msg) {
        return new ApiResponse<>(true, data, msg);
    }
    public static <T> ApiResponse<T> fail(String msg) {
        return new ApiResponse<>(false, null, msg);
    }
}
package com.fastcampus.BuDongSan.global.common.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    EXTERNAL_API_ERROR(HttpStatus.BAD_GATEWAY, "외부 API 통신 실패"),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "리소스를 찾을 수 없습니다."),
    INVALID_STATE(HttpStatus.CONFLICT, "리소스 상태가 유효하지 않습니다.");

    public final HttpStatus status;
    public final String message;

    ErrorCode(HttpStatus s, String m){ this.status=s; this.message=m; }
}

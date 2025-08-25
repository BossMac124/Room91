package com.fastcampus.BuDongSan.global.common.exception;

import lombok.Getter;

@Getter
public class BizException extends RuntimeException {
    private final ErrorCode errorCode;

    public BizException (ErrorCode errorCode, Throwable cause) {
        super(errorCode != null ? errorCode.message : null, cause);
        this.errorCode = errorCode;
    }
}
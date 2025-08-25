package com.fastcampus.BuDongSan.domain.news.dto;

import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;

/**
 * 뉴스 비디오 파일 응답을 컨트롤러로 전달하기 위한 내부 DTO.
 * JSON 직렬화용이 아니라, 컨트롤러의 HTTP 응답 빌드에 필요한 정보를 캡슐화합니다.
 */

public record NewsVideo (
        Resource resource,    // 스트리밍할 파일 리소스
        String filename,      // 클라이언트에 노출할 파일명
        MediaType contentType,// 기본 video/mp4
        long contentLength    // 모르면 -1
) {}

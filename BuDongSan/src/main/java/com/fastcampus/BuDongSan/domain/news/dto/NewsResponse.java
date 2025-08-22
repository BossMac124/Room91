package com.fastcampus.BuDongSan.domain.news.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fastcampus.BuDongSan.domain.news.entity.News;

import java.time.LocalDateTime;

public record NewsResponse(
        long id,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt,
        String newsText
) {
    public static NewsResponse from(News n) {
        return new NewsResponse(n.getId(), n.getCreatedAt(), n.getNewsText());
    }
}

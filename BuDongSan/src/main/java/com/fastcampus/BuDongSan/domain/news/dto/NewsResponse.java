package com.fastcampus.BuDongSan.domain.news.dto;

import com.fastcampus.BuDongSan.domain.news.entity.News;

import java.time.format.DateTimeFormatter;

public record NewsResponse(
        long id,
        String createdAt,
        String newsText
) {
    private static final DateTimeFormatter DTF = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public static NewsResponse from(News n) {
        return new NewsResponse(
                n.getId(),
                n.getCreatedAt() != null ? n.getCreatedAt().toLocalDate().format(DTF) : null,
                n.getNewsText()
        );
    }}

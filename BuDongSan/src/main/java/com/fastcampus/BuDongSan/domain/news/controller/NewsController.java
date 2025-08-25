package com.fastcampus.BuDongSan.domain.news.controller;

import com.fastcampus.BuDongSan.domain.news.dto.NewsResponse;
import com.fastcampus.BuDongSan.domain.news.entity.News;
import com.fastcampus.BuDongSan.domain.news.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    // mp4 파일 제공 API
    @GetMapping("/video/{id}")
    public ResponseEntity<Resource> getNewsVideo(@PathVariable Long id) {
        var video = newsService.loadVideo(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + video.filename() + "\"")
                .contentType(MediaType.parseMediaType("video/mp4"))
                .body(video.resource());
    }

    // 전체 뉴스 목록 반환 (JSON 형식)
    @GetMapping
    public ResponseEntity<?> getAllNews() {
        return ResponseEntity.ok(newsService.list());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NewsResponse> getNewsById(@PathVariable Long id) {
        News news = newsService.getEntityById(id);
        return ResponseEntity.ok(NewsResponse.from(news));
    }
}

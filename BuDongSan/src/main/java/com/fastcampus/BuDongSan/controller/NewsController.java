package com.fastcampus.BuDongSan.controller;

import com.fastcampus.BuDongSan.entity.News;
import com.fastcampus.BuDongSan.repository.postgre.NewsRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/news")
public class NewsController {


    private final NewsRepository newsRepository;

    @Value("${news.video-dir}")
    private String videoDir;

    private Path videoPath;

    @PostConstruct
    public void init() {
        this.videoPath = Paths.get(videoDir);
        System.out.println("✅ NewsController 등록됨");
        System.out.println("📁 영상 경로: " + videoPath.toAbsolutePath());
    }

    public NewsController(NewsRepository newsRepository) {
        this.newsRepository = newsRepository;
    }

    // 전체 뉴스 목록 반환 (JSON 형식)
    @GetMapping
    public ResponseEntity<?> getAllNews() {
        return ResponseEntity.ok(newsRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<News> getNewsById(@PathVariable Long id) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 뉴스가 존재하지 않습니다."));
        return ResponseEntity.ok(news);
    }

//    @GetMapping("/test")
//    public String test() {
//        return "뉴스 테스트용 컨트롤러입니다.";
//    }


    // mp4 파일 제공 API
    @GetMapping("/video/{id}")
    public ResponseEntity<Resource> getNewsVideo(@PathVariable Long id) throws MalformedURLException {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 뉴스가 존재하지 않습니다."));

        // created_at 날짜 기반 폴더 추출 (예: 20250723)
        String folderName = news.getCreatedAt().toLocalDate().toString().replace("-", "");
        Path videoFilePath = videoPath.resolve(folderName).resolve("news_" + folderName + ".mp4");

        Resource resource = new UrlResource(videoFilePath.toUri());

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"news_" + folderName + ".mp4\"")
                .contentType(MediaType.parseMediaType("video/mp4"))
                .body(resource);
    }
}

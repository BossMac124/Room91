package com.fastcampus.BuDongSan.controller;

import com.fastcampus.BuDongSan.Entity.News;
import com.fastcampus.BuDongSan.repository.postgre.NewsRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Controller
@RequestMapping("/news")
public class NewsController {


    private final NewsRepository newsRepository;

    // 로컬에 있는 mp4 파일 경로 (절대 경로로 설정 권장)
    private final Path videoPath = Paths.get("/Users/kimhanseop/Desktop/project/Room91/Python/tts/output/news_video.mp4");

    public NewsController(NewsRepository newsRepository) {
        this.newsRepository = newsRepository;
    }

    // 기본 확인용 엔드포인트
    @GetMapping("/{id}")
    public String getNewsPage(@PathVariable Long id, Model model) {
        System.out.println("요청된 ID: " + id); // id 값 확인

        News news = newsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 뉴스가 존재하지 않습니다."));

        System.out.println("뉴스 본문: " + news.getNewsPrompt()); // newsPrompt 값 확인

        model.addAttribute("news", news);
        return "news";
    }

    // mp4 파일 제공 API
    @GetMapping("/video")
    public ResponseEntity<Resource> getNewsVideo() throws MalformedURLException {
        Resource resource = new UrlResource(videoPath.toUri());

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"news_video.mp4\"")
                .contentType(MediaType.parseMediaType("video/mp4"))
                .body(resource);
    }
}

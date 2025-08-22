package com.fastcampus.BuDongSan.domain.notice.controller;

import com.fastcampus.BuDongSan.domain.notice.dto.NoticeDto;
import com.fastcampus.BuDongSan.domain.notice.service.ImageUploadService;
import com.fastcampus.BuDongSan.domain.notice.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@CrossOrigin(origins = "https://room91.org", allowCredentials = "true")
@RestController
@RequestMapping("/api/notice")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;
    private final ImageUploadService imageUploadService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/upload/image")
    public ResponseEntity<Map<String, Object>> uploadImage(@RequestParam("upload") MultipartFile file) {
        try {
            String imageUrl = imageUploadService.saveImage(file);

            return ResponseEntity.ok(Map.of(
                    "uploaded", true,
                    "url", imageUrl
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "uploaded", false,
                    "error", Map.of("message", "이미지 업로드 실패")
            ));
        }
    }

    // 공지사항 목록 조회 - 페이지네이션 포함
    @GetMapping
    public Page<NoticeDto> getNotices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return noticeService.getNotices(page, size);
    }

    @GetMapping("/{id}")
    public NoticeDto getNotice(@PathVariable Long id) {
        return noticeService.getNoticeById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public NoticeDto createNotice(@RequestBody NoticeDto dto) {
        return noticeService.createNotice(dto);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public NoticeDto updateNotice(@PathVariable Long id, @RequestBody NoticeDto dto) {
        return noticeService.updateNotice(id, dto);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteNotice(@PathVariable Long id) {
        noticeService.deleteNotice(id);
    }

    @GetMapping("/search")
    public Page<NoticeDto> searchNotices(
            @RequestParam String keyword,
            @RequestParam String type, // title, content, title_content
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return noticeService.searchNotices(keyword, type, page, size);
    }
}

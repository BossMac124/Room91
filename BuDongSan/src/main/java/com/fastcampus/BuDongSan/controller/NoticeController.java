package com.fastcampus.BuDongSan.controller;

import com.fastcampus.BuDongSan.Entity.Notice;
import com.fastcampus.BuDongSan.dto.NoticeDto;
import com.fastcampus.BuDongSan.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notice")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

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

    @PostMapping
    public NoticeDto createNotice(@RequestBody NoticeDto dto) {
        return noticeService.createNotice(dto);
    }

    @PutMapping("/{id}")
    public NoticeDto updateNotice(@PathVariable Long id, @RequestBody NoticeDto dto) {
        return noticeService.updateNotice(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deleteNotice(@PathVariable Long id) {
        noticeService.deleteNotice(id);
    }
}

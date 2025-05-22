package com.fastcampus.BuDongSan.service;

import com.fastcampus.BuDongSan.Entity.Notice;
import com.fastcampus.BuDongSan.dto.NoticeDto;
import com.fastcampus.BuDongSan.repository.postgre.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;

    @Transactional(readOnly = true)
    public NoticeDto getNoticeById(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다: " + id));
        return NoticeDto.fromEntity(notice);
    }

    // 페이지네이션 적용된 공지 목록 조회
    @Transactional(readOnly = true)
    public Page<NoticeDto> getNotices(int page, int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "updatedAt").and(Sort.by(Sort.Direction.DESC, "id"));
        Pageable pageable = PageRequest.of(page, size, sort);
        return noticeRepository.findAll(pageable)
                .map(NoticeDto::fromEntity);
    }

    // 공지 작성
    public NoticeDto createNotice(NoticeDto dto) {
        Notice saved = noticeRepository.save(dto.toEntity());
        return NoticeDto.fromEntity(saved);
    }

    // 공지 수정
    public NoticeDto updateNotice(Long id, NoticeDto dto) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다: " + id));

        notice.setTitle(dto.getTitle());
        notice.setContent(dto.getContent());
        return NoticeDto.fromEntity(noticeRepository.save(notice));
    }

    // 공지 삭제
    public void deleteNotice(Long id) {
        noticeRepository.deleteById(id);
    }

    // 키워드 검색(제목, 내용, 제목 + 내용)
    public Page<NoticeDto> searchNotices(String keyword, String type, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Notice> notices;

        switch (type) {
            case "title":
                notices = noticeRepository.findByTitleContaining(keyword, pageable);
                break;
            case "content":
                notices = noticeRepository.findByContentContaining(keyword, pageable);
                break;
            case "title_content":
                notices = noticeRepository.findByTitleContainingOrContentContaining(keyword, keyword, pageable);
                break;
            default:
                throw new IllegalArgumentException("잘못된 검색 타입입니다.");
        }

        return notices.map(NoticeDto::fromEntity);
    }

}

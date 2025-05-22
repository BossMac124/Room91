package com.fastcampus.BuDongSan.dto;

import com.fastcampus.BuDongSan.Entity.Notice;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoticeDto {
    private Long id;
    private String title;
    private String content;

    // RequestDto (요청)
    public static NoticeDto fromEntity(Notice notice) {
        return new NoticeDto(
                notice.getId(),
                notice.getTitle(),
                notice.getContent());
    }

    // ResponseDto (응답)
    public Notice toEntity() {
        Notice notice = new Notice();
        notice.setId(id);
        notice.setTitle(title);
        notice.setContent(content);
        return notice;
    }
}

package com.fastcampus.BuDongSan.domain.news.service;

import com.fastcampus.BuDongSan.domain.news.dto.NewsResponse;
import com.fastcampus.BuDongSan.domain.news.dto.NewsVideo;
import com.fastcampus.BuDongSan.domain.news.entity.News;
import com.fastcampus.BuDongSan.domain.news.repository.NewsRepository;
import com.fastcampus.BuDongSan.global.common.exception.BizException;
import com.fastcampus.BuDongSan.global.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NewsService {
    private final NewsRepository newsRepository;

    @Value("${news.video-dir}")
    private Path videoBaseDir;

    private static final DateTimeFormatter FOLDER = DateTimeFormatter.BASIC_ISO_DATE;

    public List<NewsResponse> list() {
        return newsRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(NewsResponse::from).toList();
    }

    // 엔티티가 꼭 필요한 내부 용도
    public News getEntityById(long id) {
        return newsRepository.findById(id)
                .orElseThrow(() -> new BizException(ErrorCode.RESOURCE_NOT_FOUND, null));
    }

    /** 비디오 파일 로딩 + 검증 후 DTO로 반환 */
    public NewsVideo loadVideo(Long newsId) {
        News news = getEntityById(newsId);

        if (news.getCreatedAt() == null) {
            throw new BizException(
                    ErrorCode.INVALID_STATE,
                    new IllegalStateException("createdAt is null for newsId=" + newsId)
            );
        }

        String folderName = news.getCreatedAt().toLocalDate().format(FOLDER); // yyyyMMdd
        String fileName = "news_" + folderName + ".mp4";

        Path path = Paths.get(videoBaseDir.toUri()).resolve(folderName).resolve(fileName);
        Resource res = new FileSystemResource(path);

        if (!res.exists() || !res.isReadable()) {
            throw new BizException(
                    ErrorCode.RESOURCE_NOT_FOUND,
                    new IllegalArgumentException("video not found: " + path)
            );
        }

        long len = -1L;
        try {
            len = res.contentLength(); // 가능하면 Content-Length 헤더에 넣기 위해
        } catch (IOException ignore) { /* 알 수 없으면 -1 유지 */ }

        return new NewsVideo(res, fileName, MediaType.parseMediaType("video/mp4"), len);
    }
}

package com.fastcampus.BuDongSan.domain.notice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Service
public class ImageUploadService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${custom.base-url}") // ✅ base-url 주입
    private String baseUrl;

    public String saveImage(MultipartFile file) throws IOException {
        // 고유한 파일명 생성
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();

        // 업로드 디렉토리 생성 (없을 경우)
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        // 저장 경로
        String path = uploadDir + "/" + filename;
        file.transferTo(new File(path));

        // ✅ 절대 URL 반환
        return baseUrl + "/uploads/" + filename;
    }
}

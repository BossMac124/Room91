package com.fastcampus.BuDongSan.domain.redevelopment.service;

import com.fastcampus.BuDongSan.domain.redevelopment.dto.GeoLocation;
import com.fastcampus.BuDongSan.global.config.external.KakaoMapConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j // ✅ 로거 주입
public class KakaoMapService {

    private final KakaoMapConfig kakaoMapConfig;

    /**
     * [역할] 카카오 지도 API를 호출하여 입력한 주소의 위도/경도를 조회
     */
    public GeoLocation getGeoLocation(String address) {
        try {
            String url = "https://dapi.kakao.com/v2/local/search/address.json?query=" + address;

            // ✅ 헤더 설정 (카카오 정책상 Authorization + KA 필수)
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + kakaoMapConfig.getRestApiKey());
            headers.set("KA", "java/1.0");

            HttpEntity<String> entity = new HttpEntity<>(headers);

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            // 응답 JSON 파싱
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());
            JsonNode documents = root.path("documents");

            if (documents.isArray() && !documents.isEmpty()) {
                JsonNode location = documents.get(0);
                double lat = location.path("y").asDouble();
                double lng = location.path("x").asDouble();

//                log.info("📍 좌표 변환 성공: address={}, lat={}, lng={}", address, lat, lng);

                return new GeoLocation(lat, lng, false);
            } else {
                log.warn("⚠️ 카카오 응답에 주소 결과 없음: address={}", address);
            }

        } catch (Exception e) {
            log.error("❌ 카카오 API 요청 실패: address={}, message={}", address, e.getMessage(), e);
        }

        return null;
    }
}

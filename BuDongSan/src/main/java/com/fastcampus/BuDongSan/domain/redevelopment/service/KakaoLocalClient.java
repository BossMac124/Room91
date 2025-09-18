package com.fastcampus.BuDongSan.domain.redevelopment.service;

import com.fastcampus.BuDongSan.global.config.external.KakaoMapConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class KakaoLocalClient {
    private final KakaoMapConfig kakaoMapConfig;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private HttpHeaders headers() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "KakaoAK " + kakaoMapConfig.getRestApiKey());
        headers.set("KA", "java/1.0"); // 권장
        return headers;
    }

    /**
     * 주소 지오코딩: "서울특별시 강남구 역삼동"
     */
    public Optional<double[]> geocodeAddress(String address) {
        try {
            String url = "https://dapi.kakao.com/v2/local/search/address.json?query=" + UriUtils.encode(address, StandardCharsets.UTF_8);
            ResponseEntity<String> res = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers()), String.class);
            JsonNode docs = objectMapper.readTree(res.getBody()).path("documents");
            if (docs.isArray() && !docs.isEmpty()) {
                double lng = docs.get(0).path("x").asDouble();
                double lat = docs.get(0).path("y").asDouble();
                return Optional.of(new double[]{lat, lng});
            }
        } catch (Exception e) {
            // swallow
        }
        return Optional.empty();
    }

    /**
     * 키워드 검색: "역삼동 주민센터", "신도림동 행정복지센터" 등
     */
    public Optional<double[]> searchKeyword(String query) {
        try {
            String url = "https://dapi.kakao.com/v2/local/search/keyword.json?query=" + UriUtils.encode(query, StandardCharsets.UTF_8);
            ResponseEntity<String> res = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers()), String.class);
            JsonNode docs = objectMapper.readTree(res.getBody()).path("documents");
            if (docs.isArray() && !docs.isEmpty()) {
                double lng = docs.get(0).path("x").asDouble();
                double lat = docs.get(0).path("y").asDouble();
                return Optional.of(new double[]{lat, lng});
            }
        } catch (Exception e) {
            // swallow
        }
        return Optional.empty();
    }
}

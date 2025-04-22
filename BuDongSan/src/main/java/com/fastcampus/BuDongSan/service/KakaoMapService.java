package com.fastcampus.BuDongSan.service;

import com.fastcampus.BuDongSan.Entity.GeoLocation;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;

@Service
public class KakaoMapService {

    private final String KAKAO_API_KEY = "d21c83b1e788c64c8f6d15ac5f7223fc";

    public GeoLocation getGeoLocation(String address) {
        try {
            String encodedAddress = UriUtils.encode(address, StandardCharsets.UTF_8);
            String url = "https://dapi.kakao.com/v2/local/search/address.json?query=" + encodedAddress;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + KAKAO_API_KEY);

            HttpEntity<String> entity = new HttpEntity<>(headers);
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            // 📌 로그 찍기
            System.out.println("🔍 요청 주소 (원본): " + address);
            System.out.println("🔗 요청 URL (인코딩됨): " + url);
            System.out.println("📨 Kakao 응답: " + response.getBody());

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());
            JsonNode documents = root.path("documents");

            if (documents.isArray() && documents.size() > 0) {
                JsonNode location = documents.get(0);
                double lat = location.path("y").asDouble();
                double lng = location.path("x").asDouble();

                // 📌 좌표 결과 로그
                System.out.println("✅ 좌표 찾음! 위도: " + lat + ", 경도: " + lng);

                return new GeoLocation(lat, lng);
            } else {
                System.out.println("⚠️ Kakao 응답에 주소 결과가 없습니다.");
            }

        } catch (Exception e) {
            System.out.println("❌ 예외 발생: " + e.getMessage());
            e.printStackTrace();
        }

        return null;
    }
}

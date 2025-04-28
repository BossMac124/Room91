package com.fastcampus.BuDongSan.service;

import com.fastcampus.BuDongSan.Entity.GeoLocation;
import com.fastcampus.BuDongSan.config.KakaoMapConfig;
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

@Service
@RequiredArgsConstructor
public class KakaoMapService {

    // 카카오 API키 주입
    private final KakaoMapConfig kakaoMapConfig;

    // 입력한 주소를 카카오에 요청해서 위도, 경도를 가져옴, Geolocation 객체로 변환
    public GeoLocation getGeoLocation(String address) {
        try {
            // 한글 주소를 UTF_8로 인코딩
            String encodedAddress = UriUtils.encode(address, StandardCharsets.UTF_8);
            // 카카오 주소 검색 API URL
            String url = "https://dapi.kakao.com/v2/local/search/address.json?query=" + encodedAddress;

            // 헤더 + RestTemplate 요청
            // 카카오 API는 Authorization 헤더에 KakaoAK {API_KEY} 방식으로 인증
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + kakaoMapConfig.getRestApiKey());

            // RestTemplate을 써서 HTTP 요청을 전송함
            //GET 방식으로 요청하고, 응답을 문자열 형태로 받음
            HttpEntity<String> entity = new HttpEntity<>(headers);
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            // 로그 찍기
            System.out.println("🔍 요청 주소 (원본): " + address);
            System.out.println("🔗 요청 URL (인코딩됨): " + url);
            System.out.println("📨 Kakao 응답: " + response.getBody());

            // 응답 파싱
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());
            JsonNode documents = root.path("documents");

            // 좌표 찍기
            if (documents.isArray() && documents.size() > 0) {
                JsonNode location = documents.get(0);
                double lat = location.path("y").asDouble();
                double lng = location.path("x").asDouble();

                // 좌표 결과 로그
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

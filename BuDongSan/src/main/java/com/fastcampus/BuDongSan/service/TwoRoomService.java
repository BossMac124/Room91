package com.fastcampus.BuDongSan.service;

import com.fastcampus.BuDongSan.Entity.Direction;
import com.fastcampus.BuDongSan.Entity.House;
import com.fastcampus.BuDongSan.Entity.TwoRoom;
import com.fastcampus.BuDongSan.repository.mongo.MongoDirectionRepository;
import com.fastcampus.BuDongSan.repository.mongo.MongoOneRoomRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class TwoRoomService {

    private final MongoDirectionRepository mongoDirectionRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final MongoTemplate mongoTemplate;
    private final RedisTemplate<String, String> redisTemplate;

    private static final String GOOGLE_API_KEY = "AIzaSyBf2v6wfnEQfY5LRRrOJX_3nL0D3K2gWn4";


    // 투룸 매물 필터 조회, reids 저장및 조회
    public List<TwoRoom> findTwoRoomWithFilters(Point point,
                                                Distance distance,
                                                List<String> tradeTypeCodes,
                                                Integer rentPrcMin,
                                                Integer rentPrcMax,
                                                Integer dealPrcMin,
                                                Integer dealPrcMax) throws JsonProcessingException {

        // 캐시 키를 조건별로 생성
        String cacheKey = buildCacheKey(point, distance, tradeTypeCodes, rentPrcMin, rentPrcMax, dealPrcMin, dealPrcMax);

        // 1. Redis 캐시 확인
        String cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            System.out.println("[CACHE HIT]");
            TwoRoom[] cachedArr = objectMapper.readValue(cached, TwoRoom[].class);

            // 캐시 결과에서도 필터 적용
            return Arrays.stream(cachedArr)
                    .filter(h -> isTradeTypeMatched(h, tradeTypeCodes))         // 임대유형 필터
                    .filter(h -> isRentInRange(h, rentPrcMin, rentPrcMax))     // 월세 필터
                    .filter(h -> isDepositInRange(h, dealPrcMin, dealPrcMax))  // 보증금 필터
                    .collect(Collectors.toList());
        }

        // 2. MongoDB에서 위치 기반으로만 먼저 조회
        Query query = new Query();
        query.addCriteria(Criteria.where("location").nearSphere(point).maxDistance(distance.getNormalizedValue()));
        List<TwoRoom> mongoResults = mongoTemplate.find(query, TwoRoom.class, "TwoRoom");

        // 3. 나머지 필터 조건은 Java Stream에서 적용
        List<TwoRoom> filtered = mongoResults.stream()
                .filter(h -> isTradeTypeMatched(h, tradeTypeCodes))
                .filter(h -> isRentInRange(h, rentPrcMin, rentPrcMax))
                .filter(h -> isDepositInRange(h, dealPrcMin, dealPrcMax))
                .collect(Collectors.toList());

        // 4. 캐시에 저장
        if (!filtered.isEmpty()) {
            redisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(filtered), Duration.ofHours(12));
        }

        return filtered;
    }


    private String buildCacheKey(Point point, Distance distance,
                                 List<String> tradeTypeCodes,
                                 Integer rentPrcMin, Integer rentPrcMax,
                                 Integer dealPrcMin, Integer dealPrcMax) {
        return String.format("house:%f:%f:%f:%s:%s:%s:%s:%s",
                point.getX(), point.getY(), distance.getValue(),
                tradeTypeCodes != null ? String.join("-", tradeTypeCodes) : "ALL",
                rentPrcMin != null ? rentPrcMin : "N",
                rentPrcMax != null ? rentPrcMax : "N",
                dealPrcMin != null ? dealPrcMin : "N",
                dealPrcMax != null ? dealPrcMax : "N");
    }

    // 임대유형이 일치하는지 확인 (null이면 전체 허용)
    private boolean isTradeTypeMatched(TwoRoom h, List<String> tradeTypes) {
        return tradeTypes == null || tradeTypes.isEmpty() || tradeTypes.contains(h.getTradeTypeCode());
    }

    // 월세 필터 적용 (null 허용)
    private boolean isRentInRange(TwoRoom h, Integer min, Integer max) {
        Integer rent = parseRentToInt(h.getRentPrc()); // 문자열 혹은 정수로 저장되었을 수 있으므로 변환
        if (rent == null) return false;
        if (min != null && rent < min) return false;
        if (max != null && rent > max) return false;
        return true;
    }

    // 보증금 필터 적용 (null 허용)
    private boolean isDepositInRange(TwoRoom h, Integer min, Integer max) {
        Integer deposit = parseDepositToManwon(h.getDealOrWarrantPrc()); // 문자열 파싱
        if (deposit == null) return false;
        if (min != null && deposit < min) return false;
        if (max != null && deposit > max) return false;
        return true;
    }

    // 보증금 문자열 ("8,000") → 정수(8000, 만원 단위)
    private Integer parseDepositToManwon(String str) {
        try {
            if (str == null) return null;
            return Integer.parseInt(str.replaceAll(",", "").trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    // 월세 값이 숫자인지 안전하게 파싱 (null-safe)
    private Integer parseRentToInt(Object rentPrc) {
        if (rentPrc == null) return null;

        if (rentPrc instanceof Integer) return (Integer) rentPrc; // 정수형이면 그대로 반환

        try {
            return Integer.parseInt(rentPrc.toString().replaceAll(",", "").trim()); // 문자열이면 정수 변환
        } catch (NumberFormatException e) {
            return null;
        }
    }
}

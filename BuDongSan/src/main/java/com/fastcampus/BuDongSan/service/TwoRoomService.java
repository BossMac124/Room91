package com.fastcampus.BuDongSan.service;

import com.fastcampus.BuDongSan.entity.TwoRoom;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class TwoRoomService {


    private final ObjectMapper objectMapper;
    private final MongoTemplate mongoTemplate;
    private final RedisTemplate<String, String> redisTemplate;

    // 투룸 매물 필터 조회, reids 저장및 조회
    public List<TwoRoom> findTwoRoomWithFilters(
            Point point, Distance distance, List<String> tradeTypes,
            Integer rentPrcMin, Integer rentPrcMax, Integer dealPrcMin, Integer dealPrcMax
    ) throws JsonProcessingException {

        // 캐시 키 (prefix 분리: 충돌 방지)
        String cacheKey = buildCacheKey(point, distance, tradeTypes, rentPrcMin, rentPrcMax, dealPrcMin, dealPrcMax);

        // 1) Redis
        String cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            TwoRoom[] arr = objectMapper.readValue(cached, TwoRoom[].class);
            return Arrays.stream(arr)
                    .filter(h -> isTradeTypeMatched(h, tradeTypes))
                    .filter(h -> isRentInRange(h, rentPrcMin, rentPrcMax))
                    .filter(h -> isDepositInRange(h, dealPrcMin, dealPrcMax))
                    .collect(Collectors.toList());
        }

        // 2) Mongo: 위치 + (임대유형 있으면) tradeTypeName in (...)
        List<Criteria> ands = new ArrayList<>();
        ands.add(Criteria.where("location").nearSphere(point).maxDistance(distance.getNormalizedValue()));
        if (tradeTypes != null && !tradeTypes.isEmpty()) {
            ands.add(Criteria.where("tradeTypeName").in(tradeTypes));
        }
        Query query = new Query(new Criteria().andOperator(ands.toArray(new Criteria[0])));
        List<TwoRoom> mongoResults = mongoTemplate.find(query, TwoRoom.class, "TwoRoom");

        // 3) 2차 필터 (문자열 수치 변환 포함)
        List<TwoRoom> filtered = mongoResults.stream()
                .filter(h -> isTradeTypeMatched(h, tradeTypes))
                .filter(h -> isRentInRange(h, rentPrcMin, rentPrcMax))
                .filter(h -> isDepositInRange(h, dealPrcMin, dealPrcMax))
                .collect(Collectors.toList());

        if (!filtered.isEmpty()) {
            redisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(filtered), Duration.ofHours(12));
        }
        return filtered;
    }

    // ✅ 임대유형 비교는 tradeTypeName으로 (원룸과 동일)
    private boolean isTradeTypeMatched(TwoRoom h, List<String> tradeTypes) {
        return tradeTypes == null || tradeTypes.isEmpty() || tradeTypes.contains(h.getTradeTypeName());
    }

    // ✅ 월세 필터는 "월세"에만 적용. 범위 미지정이면 패스
    private boolean isRentInRange(TwoRoom h, Integer min, Integer max) {
        if (!"월세".equals(h.getTradeTypeName())) return true;         // 전세/단기임대는 월세 필터 미적용
        if (min == null && max == null) return true;                   // 범위 없으면 통과
        Integer rent = parseRentToInt(h.getRentPrc());
        if (rent == null) return false;
        if (min != null && rent < min) return false;
        if (max != null && rent > max) return false;
        return true;
    }

    // ✅ 보증금: "1억 2,000" 형태 지원 (원룸과 동일 로직)
    private Integer parseDepositToManwon(String str) {
        if (str == null || str.isBlank()) return null;
        String s = str.replaceAll("\\s+", "").replaceAll(",", "");
        int total = 0;
        int idxEok = s.indexOf("억");
        if (idxEok != -1) {
            String eok = s.substring(0, idxEok);
            try { total += Integer.parseInt(eok) * 10000; } catch (NumberFormatException e) { return null; }
            s = s.substring(idxEok + 1);
        }
        if (!s.isEmpty()) {
            if (s.endsWith("만")) s = s.substring(0, s.length() - 1);
            if (!s.isEmpty()) {
                try { total += Integer.parseInt(s); } catch (NumberFormatException e) { return null; }
            }
        }
        return total;
    }

    // 🔑 캐시 키 prefix 구분 (충돌 예방)
    private String buildCacheKey(Point point, Distance distance,
                                 List<String> tradeTypes,
                                 Integer rentPrcMin, Integer rentPrcMax,
                                 Integer dealPrcMin, Integer dealPrcMax) {
        return String.format("tworoom:%f:%f:%f:%s:%s:%s:%s:%s",
                point.getX(), point.getY(), distance.getValue(),
                tradeTypes != null ? String.join("-", tradeTypes) : "ALL",
                rentPrcMin != null ? rentPrcMin : "N",
                rentPrcMax != null ? rentPrcMax : "N",
                dealPrcMin != null ? dealPrcMin : "N",
                dealPrcMax != null ? dealPrcMax : "N");
    }
    // 보증금 필터 적용 (null 허용)
    private boolean isDepositInRange(TwoRoom h, Integer min, Integer max) {
        Integer deposit = parseDepositToManwon(h.getDealOrWarrantPrc()); // 문자열 파싱
        if (deposit == null) return false;
        if (min != null && deposit < min) return false;
        if (max != null && deposit > max) return false;
        return true;
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

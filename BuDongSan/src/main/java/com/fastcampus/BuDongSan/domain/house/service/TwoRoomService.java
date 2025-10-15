package com.fastcampus.BuDongSan.domain.house.service;

import com.fastcampus.BuDongSan.domain.house.entity.TwoRoom;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Metrics;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StopWatch;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class TwoRoomService {

    private final MongoTemplate mongoTemplate;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${Room91.cache.tworoom.enabled:true}")
    private boolean cacheEnabled;

    // ✅ 투룸 매물 필터 조회 (Redis 캐시 ON/OFF)
    public List<TwoRoom> findTwoRoomWithFilters(
            Point point,
            Distance distance,
            List<String> tradeTypeCodes,
            Integer rentPrcMin,
            Integer rentPrcMax,
            Integer dealPrcMin,
            Integer dealPrcMax
    ) throws JsonProcessingException {

        double radiusKm = distance.getValue();
        if (radiusKm > 30.0) {
            log.warn("[RANGE LIMIT] 요청된 반경 {}km → 최대 30km로 제한", radiusKm);
            radiusKm = 30.0;
            distance = new Distance(radiusKm, Metrics.KILOMETERS);
        }

        if (radiusKm < 0.1) {
            log.warn("[RANGE LIMIT] 요청된 반경 {}km → 최소 0.1km로 조정", radiusKm);
            radiusKm = 0.1;
            distance = new Distance(radiusKm, Metrics.KILOMETERS);
        }

        // 🔹 1. 캐시 비활성화 시 Redis 건너뜀
        if (!cacheEnabled) {
            log.info("[CACHE OFF] Redis 비활성화됨 → MongoDB 직접 조회 시작");
            StopWatch sw = new StopWatch("tworoom-find");
            sw.start("dbOnly");

            List<TwoRoom> result = queryFromMongo(point, distance, tradeTypeCodes,
                    rentPrcMin, rentPrcMax, dealPrcMin, dealPrcMax);

            sw.stop();
            log.info("[PERF] MongoDB 조회 완료: {}건, 소요시간 = {} ms (lat={}, lng={}, dist={})",
                    result.size(), sw.getTotalTimeMillis(), point.getY(), point.getX(), distance.getValue());
            return result;
        }

        // 🔹 2. 캐시 활성화 시 기존 로직 수행
        String cacheKey = buildCacheKey(point, distance, tradeTypeCodes,
                rentPrcMin, rentPrcMax, dealPrcMin, dealPrcMax);

        StopWatch sw = new StopWatch("tworoom-cache");
        sw.start("read-cache");

        String cached = redisTemplate.opsForValue().get(cacheKey);

        if (cached != null) {
            List<TwoRoom> cachedList = Arrays.asList(objectMapper.readValue(cached, TwoRoom[].class));
            sw.stop();
            log.info("[CACHE HIT] Redis 캐시 조회 완료: {}건 (소요시간={}ms, key={}, lat={}, lng={}, dist={}km)",
                    cachedList.size(), sw.getTotalTimeMillis(), cacheKey, point.getY(), point.getX(), distance.getValue());
            return cachedList;
        }

        sw.stop();
        StopWatch dbWatch = new StopWatch("tworoom-db");
        dbWatch.start("cacheMiss-db");

        List<TwoRoom> filtered = queryFromMongo(point, distance, tradeTypeCodes,
                rentPrcMin, rentPrcMax, dealPrcMin, dealPrcMax);

        dbWatch.stop();

        if (!filtered.isEmpty()) {
            redisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(filtered),
                    Duration.ofHours(1));
            log.info("[CACHE MISS] MongoDB 조회 후 Redis 저장 완료: {}건 (소요시간={}ms, key={}, lat={}, lng={}, dist={}km)",
                    filtered.size(), dbWatch.getTotalTimeMillis(), cacheKey, point.getY(), point.getX(), distance.getValue());
        } else {
            log.info("[CACHE MISS] MongoDB 조회 결과 없음 (소요시간={}ms, key={}, lat={}, lng={}, dist={}km)",
                    dbWatch.getTotalTimeMillis(), cacheKey, point.getY(), point.getX(), distance.getValue());
        }

        return filtered;
    }

    // ✅ MongoDB 조회 전용
    private List<TwoRoom> queryFromMongo(Point point, Distance distance,
                                         List<String> tradeTypeCodes,
                                         Integer rentPrcMin, Integer rentPrcMax,
                                         Integer dealPrcMin, Integer dealPrcMax) {

        List<String> types = (tradeTypeCodes == null || tradeTypeCodes.isEmpty()) ? null : tradeTypeCodes;

        int depMin  = dealPrcMin != null ? dealPrcMin : 0;
        int depMax  = dealPrcMax != null ? dealPrcMax : Integer.MAX_VALUE;
        int rentMin = rentPrcMin != null ? rentPrcMin : 0;
        int rentMax = rentPrcMax != null ? rentPrcMax : Integer.MAX_VALUE;

        Criteria geo = Criteria.where("location")
                .nearSphere(point)
                .maxDistance(distance.getNormalizedValue());

        List<Criteria> ands = new ArrayList<>();
        ands.add(geo);
        if (types != null) ands.add(Criteria.where("tradeTypeName").in(types));

        Query query = new Query(new Criteria().andOperator(ands.toArray(new Criteria[0])));

        List<TwoRoom> mongoResults = mongoTemplate.find(query, TwoRoom.class, "TwoRoom");

        return mongoResults.stream()
                .filter(h -> isDepositInRange(h, depMin, depMax))
                .filter(h -> {
                    if ("월세".equals(h.getTradeTypeName()))
                        return isRentInRange(h, rentMin, rentMax);
                    return true;
                })
                .collect(Collectors.toList());
    }

    // ✅ 캐시 키 생성 (원룸과 동일)
    private String buildCacheKey(Point point, Distance distance,
                                 List<String> tradeTypeCodes,
                                 Integer rentPrcMin, Integer rentPrcMax,
                                 Integer dealPrcMin, Integer dealPrcMax) {
        // ✅ 좌표를 구 단위로 라운딩 → 0.01 ≈ 약 1.1km
        double roundedLng = Math.round(point.getX() * 100.0) / 100.0;
        double roundedLat = Math.round(point.getY() * 100.0) / 100.0;
        double roundedDist = Math.round(distance.getValue()); // 반경 km 단위 반올림

        return String.format("tworoom:%.5f:%.5f:%.1f:%s:%d:%d:%d:%d",
                roundedLng, roundedLat, roundedDist,
                (tradeTypeCodes == null ? "ALL" :
                        tradeTypeCodes.stream().sorted().collect(Collectors.joining(","))),
                rentPrcMin, rentPrcMax, dealPrcMin, dealPrcMax);
    }

    // ✅ 보증금 필터
    private boolean isDepositInRange(TwoRoom h, Integer min, Integer max) {
        Integer deposit = parseDepositToManwon(h.getDealOrWarrantPrc());
        if (deposit == null) return false;
        if (min != null && deposit < min) return false;
        if (max != null && deposit > max) return false;
        return true;
    }

    // ✅ 월세 필터
    private boolean isRentInRange(TwoRoom h, Integer min, Integer max) {
        Integer rent = parseRentToInt(h.getRentPrc());
        if (rent == null) return false;
        if (min != null && rent < min) return false;
        if (max != null && rent > max) return false;
        return true;
    }

    // ✅ 보증금 문자열 → 정수 변환
    private Integer parseDepositToManwon(String str) {
        if (str == null || str.isBlank()) return null;
        String s = str.replaceAll("\\s+", "").replaceAll(",", "");
        int total = 0;
        int idxEok = s.indexOf("억");
        if (idxEok != -1) {
            String eok = s.substring(0, idxEok);
            try {
                total += Integer.parseInt(eok) * 10000;
            } catch (NumberFormatException e) {
                return null;
            }
            s = s.substring(idxEok + 1);
        }
        if (!s.isEmpty()) {
            if (s.endsWith("만")) s = s.substring(0, s.length() - 1);
            if (!s.isEmpty()) {
                try {
                    total += Integer.parseInt(s);
                } catch (NumberFormatException e) {
                    return null;
                }
            }
        }
        return total;
    }

    // ✅ 월세 문자열 → 정수 변환
    private Integer parseRentToInt(Object rentPrc) {
        if (rentPrc == null) return null;
        if (rentPrc instanceof Integer) return (Integer) rentPrc;
        try {
            return Integer.parseInt(rentPrc.toString().replaceAll(",", "").trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}

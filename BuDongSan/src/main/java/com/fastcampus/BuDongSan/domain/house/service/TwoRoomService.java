package com.fastcampus.BuDongSan.domain.house.service;

import com.fastcampus.BuDongSan.domain.house.entity.TwoRoom;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class TwoRoomService {

    private static final String TWOROOM_COLLECTION = "TwoRoom";
    private static final String CACHE_PREFIX = "tworoom";
    private static final Duration BASE_TTL = Duration.ofHours(12); // 기본 TTL
    private static final int JITTER_PERCENT = 15; // ±15% 지터

    private final ObjectMapper objectMapper;
    private final MongoTemplate mongoTemplate;
    private final RedisTemplate<String, String> redisTemplate;

    /**
     * 투룸 매물 조회(위치+필터) + Redis 캐시
     * - 캐시 키에 모든 필터 파라미터를 포함 → 캐시 HIT 시 재필터링 불필요
     * - 상세 로그: CACHE HIT/MISS, DB 검색 시간, 결과 수, 캐시 SET, 전체 실행시간
     */
    public List<TwoRoom> findTwoRoomWithFilters(
            Point point, Distance distance, List<String> tradeTypes,
            Integer rentPrcMin, Integer rentPrcMax, Integer dealPrcMin, Integer dealPrcMax
    ) {
        final long startNs = System.nanoTime();
        final String cacheKey = buildCacheKey(point, distance, tradeTypes, rentPrcMin, rentPrcMax, dealPrcMin, dealPrcMax);

        // 1) Redis 캐시
        try {
            String cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                List<TwoRoom> fromCache = Arrays.asList(objectMapper.readValue(cached, TwoRoom[].class));
                log.info("TWOROOM_CACHE HIT key={} size={}", cacheKey, fromCache.size());
                logExecTime("TwoRoomService.findTwoRoomWithFilters", startNs);
                return fromCache;
            } else {
                log.info("TWOROOM_CACHE MISS key={}", cacheKey);
            }
        } catch (Exception e) {
            // 캐시 오류는 서비스 장애로 번지지 않게 경고만
            log.warn("TWOROOM_CACHE ERROR key={}, err={}", cacheKey, e.toString());
        }

        // 2) Mongo 질의: 위치 + (임대유형 in)
        List<Criteria> ands = new ArrayList<>();
        ands.add(Criteria.where("location").nearSphere(point).maxDistance(distance.getNormalizedValue()));
        if (tradeTypes != null && !tradeTypes.isEmpty()) {
            ands.add(Criteria.where("tradeTypeName").in(tradeTypes));
        }
        Query query = new Query(new Criteria().andOperator(ands.toArray(new Criteria[0])));

        long dbStartNs = System.nanoTime();
        List<TwoRoom> mongoResults = mongoTemplate.find(query, TwoRoom.class, TWOROOM_COLLECTION);
        long dbTookMs = (System.nanoTime() - dbStartNs) / 1_000_000;
        log.info("TWOROOM_DB find took {} ms, returned {}", dbTookMs, mongoResults.size());

        // 3) 2차 필터 (월세/보증금 범위)
        List<TwoRoom> filtered = mongoResults.stream()
                .filter(h -> isTradeTypeMatched(h, tradeTypes))
                .filter(h -> isRentInRange(h, rentPrcMin, rentPrcMax))
                .filter(h -> isDepositInRange(h, dealPrcMin, dealPrcMax))
                .collect(Collectors.toList());
        log.info("TWOROOM_QUERY resultSize={} key={} lat={},lng={},radius={},types={},rent=[{}-{}],deposit=[{}-{}]",
                filtered.size(),
                cacheKey,
                point.getY(), point.getX(), distance.getValue(),
                tradeTypes, rentPrcMin, rentPrcMax, dealPrcMin, dealPrcMax
        );

        // 4) 캐시 저장 (지터 적용)
        if (!filtered.isEmpty()) {
            Duration ttl = withJitter(BASE_TTL, JITTER_PERCENT);
            try {
                String payload = objectMapper.writeValueAsString(filtered);
                redisTemplate.opsForValue().set(cacheKey, payload, ttl);
                log.info("TWOROOM_CACHE SET key={} ttl={} size={}", cacheKey, ttl, filtered.size());
            } catch (JsonProcessingException e) {
                log.warn("TWOROOM_CACHE SET ERROR key={}, err={}", cacheKey, e.toString());
            }
        }

        logExecTime("TwoRoomService.findTwoRoomWithFilters", startNs);
        return filtered;
    }

    // ========= 유틸 & 필터 =========

    // ✅ 임대유형 비교는 tradeTypeName으로
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

    // ✅ 보증금: "1억 2,000만 원" 형태 안전 파싱(만/원 제거 지원)
    private Integer parseDepositToManwon(String str) {
        if (str == null || str.isBlank()) return null;
        String s = str.replaceAll("\\s+", "")
                .replaceAll(",", "")
                .replace("원", "");
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
        if (rentPrc instanceof Integer) return (Integer) rentPrc;
        try {
            return Integer.parseInt(rentPrc.toString().replaceAll(",", "").trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    // 🔑 캐시 키 prefix 구분 (충돌 예방)
    private String buildCacheKey(Point point, Distance distance,
                                 List<String> tradeTypes,
                                 Integer rentPrcMin, Integer rentPrcMax,
                                 Integer dealPrcMin, Integer dealPrcMax) {
        return String.format(Locale.ROOT, "%s:%f:%f:%f:%s:%s:%s:%s:%s",
                CACHE_PREFIX,
                point.getX(), point.getY(), distance.getValue(),
                (tradeTypes != null && !tradeTypes.isEmpty()) ? String.join("-", tradeTypes) : "ALL",
                rentPrcMin != null ? rentPrcMin : "N",
                rentPrcMax != null ? rentPrcMax : "N",
                dealPrcMin != null ? dealPrcMin : "N",
                dealPrcMax != null ? dealPrcMax : "N"
        );
    }

    // TTL에 ±JITTER_PERCENT% 지터 적용
    private Duration withJitter(Duration base, int jitterPercent) {
        if (jitterPercent <= 0) return base;
        long seconds = base.getSeconds();
        long delta = (seconds * jitterPercent) / 100;
        long min = seconds - delta;
        long max = seconds + delta;
        long jittered = ThreadLocalRandom.current().nextLong(min, max + 1);
        return Duration.ofSeconds(Math.max(1, jittered));
    }

    // 실행 시간 로그
    private void logExecTime(String name, long startNs) {
        long tookMs = (System.nanoTime() - startNs) / 1_000_000;
        log.info("EXEC {} took {} ms", name, tookMs);
    }
}

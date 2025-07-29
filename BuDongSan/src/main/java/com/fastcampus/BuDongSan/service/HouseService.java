package com.fastcampus.BuDongSan.service;

import com.fastcampus.BuDongSan.entity.Direction;
import com.fastcampus.BuDongSan.entity.House;
import com.fastcampus.BuDongSan.dto.DirectionResponseDto;
import com.fastcampus.BuDongSan.dto.LatLngDto;
import com.fastcampus.BuDongSan.repository.mongo.MongoDirectionRepository;
import com.fastcampus.BuDongSan.repository.mongo.MongoOneRoomRepository;
import com.fastcampus.BuDongSan.util.PolylineUtils;
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
public class HouseService {

    private final MongoDirectionRepository mongoDirectionRepository;
    private final MongoOneRoomRepository mongoOneRoomRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final MongoTemplate mongoTemplate;
    private final RedisTemplate<String, String> redisTemplate;

    private static final String GOOGLE_API_KEY = "AIzaSyBf2v6wfnEQfY5LRRrOJX_3nL0D3K2gWn4";

    // 원룸 매물 필터 조회, reids 저장및 조회
    public List<House> findByLocationWithFilters(Point point,
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
            House[] cachedArr = objectMapper.readValue(cached, House[].class);

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
        List<House> mongoResults = mongoTemplate.find(query, House.class, "OneRoom");

        // 3. 나머지 필터 조건은 Java Stream에서 적용
        List<House> filtered = mongoResults.stream()
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




    // 구글 길찾기 API 호출
    public JsonNode getDirections(double originLat, double originLng, double destLat, double destLng) throws IOException {
        String url = String.format(
                "https://maps.googleapis.com/maps/api/directions/json?origin=%f,%f&destination=%f,%f&mode=transit&key=%s",
                originLat, originLng, destLat, destLng, GOOGLE_API_KEY
        );
        System.out.println("[DirectionsService] 요청 URL: " + url);

        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Google Directions API 호출 실패: " + response.getStatusCode());
        }
        return objectMapper.readTree(response.getBody());
    }

    // MongoDB에서 인근(출발/도착 150m 이내) 길찾기 결과 조회
    public Optional<Direction> findDirectionByMongoDB(double originLat, double originLng, double destLat, double destLng) {
        final double MAX_DISTANCE_METERS = 150.0;
        // GeoJSON는 (경도, 위도) 순서임
        Point origin = new Point(originLng, originLat);
        Point destination = new Point(destLng, destLat);

        // 최대 거리를 라디안 단위로 변환 (MongoDB의 nearSphere는 라디안)
        double maxDistanceRadians = MAX_DISTANCE_METERS / 6378137.0;

        // 1. 출발지(origin) 기준으로 geo 조건을 적용하여 쿼리합니다.
        Query query = Query.query(Criteria.where("origin")
                        .nearSphere(origin)
                        .maxDistance(maxDistanceRadians))
                .with(Sort.by(Sort.Direction.DESC, "createdAt"));

        // 이 쿼리로 조회된 결과는 출발지가 query 기준과 가까운 Direction 객체들의 리스트입니다.
        List<Direction> directions = mongoTemplate.find(query, Direction.class);

        // 2. 애플리케이션 레벨에서 도착지(destination) 기준 필터 적용
        List<Direction> filtered = directions.stream()
                .filter(d -> {
                    // d.getDestination()는 Point 타입 (x=경도, y=위도)
                    double storedLng = d.getDestination().getX();
                    double storedLat = d.getDestination().getY();
                    // query의 도착지와 문서에 저장된 도착지 사이의 거리를 계산
                    double distance = distanceInMeters(destLat, destLng, storedLat, storedLng);
                    return distance <= MAX_DISTANCE_METERS;
                })
                .collect(Collectors.toList());

        // 3. 필터링 결과가 있으면 최신 순 정렬되어 있으므로 첫 번째 요소를 반환합니다.
        if (filtered.isEmpty()) {
            return Optional.empty();
        } else {
            return Optional.of(filtered.get(0));
        }
    }

    // Redis에서 길찾기 결과 조회 (key: directions:origin:destination)
    public JsonNode findDirectionByRedis(double originLat, double originLng, double destLat, double destLng) throws JsonProcessingException {
        String key = String.format("directions:%.5f,%.5f:%.5f,%.5f", originLat, originLng, destLat, destLng);
        System.out.println("[REDIS] 생성된 키: " + key);
        String cached = redisTemplate.opsForValue().get(key);
        if (cached != null) {
            System.out.println("[CACHE HIT] Redis에서 가져옴");
            return objectMapper.readTree(cached);
        }
        return null;
    }

    // 전체 흐름: Redis → MongoDB → Google API 호출 및 저장
    public JsonNode getOrFetchDirection(double originLat, double originLng, double destLat, double destLng) throws IOException {
        // 1. Redis 캐시 조회
        JsonNode redisResult = findDirectionByRedis(originLat, originLng, destLat, destLng);
        if (redisResult != null) {
            System.out.println("[CACHE HIT] Redis에서 가져옴");
            return redisResult;
        }

        // 2. MongoDB 조회
        Optional<Direction> optionalDirection = findDirectionByMongoDB(originLat, originLng, destLat, destLng);
        if (optionalDirection.isPresent()) {
            System.out.println("[CACHE HIT] MongoDB에서 가져옴");
            // 저장된 결과를 Redis에도 캐시
            saveDirectionToRedis(optionalDirection.get(), originLat, originLng, destLat, destLng);
            // 반환은 Direction 객체를 JSON으로 변환
            return objectMapper.valueToTree(optionalDirection.get());
        }

        // 3. Redis, MongoDB 모두 없으면 Google API 호출
        JsonNode apiResult = getDirections(originLat, originLng, destLat, destLng);
        // API 결과를 Direction 객체로 변환 (필수 데이터 추출)
        Direction direction = parseDirectionFromJson(originLat, originLng, destLat, destLng, apiResult);

        // MongoDB에 저장 (영구 저장)
        mongoDirectionRepository.save(direction);
        // Redis에 저장 (캐시)
        saveDirectionToRedis(direction, originLat, originLng, destLat, destLng);

        // 반환: 저장된 direction 객체를 JSON으로 변환
        return objectMapper.valueToTree(direction);
    }

    // API JSON 응답에서 필수 데이터만 추출하여 Direction 객체 생성
    private Direction parseDirectionFromJson(double originLat, double originLng, double destLat, double destLng, JsonNode json) {
        Direction direction = new Direction();
        direction.setId(UUID.randomUUID().toString());
        direction.setOrigin(new GeoJsonPoint(originLng, originLat));
        direction.setDestination(new GeoJsonPoint(destLng, destLat));

        // routes 배열의 첫 번째 경로를 사용
        JsonNode routes = json.path("routes");
        if (routes.isArray() && routes.size() > 0) {
            JsonNode firstRoute = routes.get(0);
            // legs 배열의 첫 번째 요소에서 거리와 소요시간 추출
            JsonNode legs = firstRoute.path("legs");
            if (legs.isArray() && legs.size() > 0) {
                JsonNode firstLeg = legs.get(0);
                direction.setDistance(firstLeg.path("distance").path("text").asText());
                direction.setDuration(firstLeg.path("duration").path("text").asText());
            }
            // 전체 경로 polyline 및 요약 추출
            direction.setPolyline(firstRoute.path("overview_polyline").path("points").asText());
            direction.setSummary(firstRoute.path("summary").asText());
        }
        direction.setCreatedAt(Instant.now());
        return direction;
    }

    // Redis에 길찾기 결과 저장 (TTL: 1시간)
    private void saveDirectionToRedis(Direction direction, double originLat, double originLng, double destLat, double destLng) throws JsonProcessingException {
        String key = String.format("directions:%.5f,%.5f:%.5f,%.5f", originLat, originLng, destLat, destLng);
        System.out.println("[REDIS] 저장할 키: " + key);
        String jsonString = objectMapper.writeValueAsString(direction);
        redisTemplate.opsForValue().set(key, jsonString, Duration.ofHours(1));
    }

    /**
     * 두 좌표 사이의 거리를 미터 단위로 계산하는 메서드 (하버사인 공식 사용)
     * @param lat1 첫 번째 좌표의 위도
     * @param lng1 첫 번째 좌표의 경도
     * @param lat2 두 번째 좌표의 위도
     * @param lng2 두 번째 좌표의 경도
     * @return 두 좌표 사이의 거리 (미터)
     */
    private double distanceInMeters(double lat1, double lng1, double lat2, double lng2) {
        final int R = 6371000; // 지구의 반지름 (미터)
        double latDistance = Math.toRadians(lat2 - lat1);
        double lngDistance = Math.toRadians(lng2 - lng1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lngDistance / 2) * Math.sin(lngDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // 임대유형이 일치하는지 확인 (null이면 전체 허용)
    private boolean isTradeTypeMatched(House h, List<String> tradeTypes) {
        return tradeTypes == null || tradeTypes.isEmpty() || tradeTypes.contains(h.getTradeTypeCode());
    }

    // 월세 필터 적용 (null 허용)
    private boolean isRentInRange(House h, Integer min, Integer max) {
        Integer rent = parseRentToInt(h.getRentPrc()); // 문자열 혹은 정수로 저장되었을 수 있으므로 변환
        if (rent == null) return false;
        if (min != null && rent < min) return false;
        if (max != null && rent > max) return false;
        return true;
    }

    // 보증금 필터 적용 (null 허용)
    private boolean isDepositInRange(House h, Integer min, Integer max) {
        Integer deposit = parseDepositToManwon(h.getDealOrWarrantPrc()); // 문자열 파싱
        if (deposit == null) return false;
        if (min != null && deposit < min) return false;
        if (max != null && deposit > max) return false;
        return true;
    }

    // 보증금 문자열 ("1억 2,000", "8,000" 등) → 만원 단위 정수
    private Integer parseDepositToManwon(String str) {
        if (str == null || str.isBlank()) return null;

        // 1) 공백과 콤마 제거
        String s = str.replaceAll("\\s+", "").replaceAll(",", "");

        int totalManwon = 0;

        // 2) '억' 단위 처리
        int idxEok = s.indexOf("억");
        if (idxEok != -1) {
            String eokPart = s.substring(0, idxEok);
            try {
                totalManwon += Integer.parseInt(eokPart) * 10000;
            } catch (NumberFormatException e) {
                return null;  // 파싱 실패 시 null 반환
            }
            s = s.substring(idxEok + 1);  // '억' 다음 부분만 남김
        }

        // 3) 나머지 (만 단위) 처리
        if (!s.isEmpty()) {
            // 끝에 "만"이 붙어 있을 수도 있으니 제거
            if (s.endsWith("만")) {
                s = s.substring(0, s.length() - 1);
            }
            if (!s.isEmpty()) {
                try {
                    totalManwon += Integer.parseInt(s);
                } catch (NumberFormatException e) {
                    return null;
                }
            }
        }

        return totalManwon;
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

    public DirectionResponseDto getOrFetchDirectionDto(
            double originLat, double originLng,
            double destLat, double destLng) throws IOException {

        // ① Redis/MongoDB/Google API 호출 로직 실행 → JsonNode 반환
        JsonNode resultNode = getOrFetchDirection(originLat, originLng, destLat, destLng);

        // ② JsonNode → Direction 엔티티로 변환
        Direction direction = objectMapper.treeToValue(resultNode, Direction.class);

        // ③ 엔티티에서 필요한 값 뽑기
        String encoded = direction.getPolyline();
        String dist    = direction.getDistance();
        String dur     = direction.getDuration();

        // ④ 디코드된 좌표 리스트 생성
        List<LatLngDto> coords = PolylineUtils.decode(encoded);

        // ⑤ DTO로 묶어서 반환
        return new DirectionResponseDto(dist, dur, encoded, coords);
    }
}

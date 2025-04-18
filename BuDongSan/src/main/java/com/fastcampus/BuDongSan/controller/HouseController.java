package com.fastcampus.BuDongSan.controller;

import com.fastcampus.BuDongSan.Entity.Direction;
import com.fastcampus.BuDongSan.Entity.House;
import com.fastcampus.BuDongSan.Entity.TwoRoom;
import com.fastcampus.BuDongSan.dto.RoomSearchRequest;
import com.fastcampus.BuDongSan.service.HouseService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Metrics;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/house")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")  // 모든 도메인에서 접근 허용
public class HouseController {

    private final HouseService houseService;
    private final ObjectMapper objectMapper;  // JSON 직렬화/역직렬화용

    /**
     * 매물 검색 엔드포인트
     * URL 예: /house?region=서울&articleName=아파트명
     * 반드시 region과 articleName 파라미터가 포함되어야 함
     */

    @GetMapping()
    public List<House> getNearbyOneRoom(
            @RequestParam double lng,
            @RequestParam double lat,
            @RequestParam(defaultValue = "3") double radius) throws JsonProcessingException {
        return houseService.findByLocationNearWithCache(new Point(lng, lat), new Distance(radius, Metrics.KILOMETERS));
    }
//
//    @GetMapping("/two")
//    public List<TwoRoom> getNearbyTwoRoom(RoomSearchRequest request) throws JsonProcessingException {
//        Point point = new Point(request.getLng(), request.getLat());
//        Distance distance = new Distance(request.getRadius(), Metrics.KILOMETERS);
//
//        // DTO에서 필터링 정보 가져오기
//        String tradeType = request.getTradeType();
//        Double minDeposit = request.getMinDeposit();
//        Double maxDeposit = request.getMaxDeposit();
//        Double minRent = request.getMinRent();
//        Double maxRent = request.getMaxRent();
//
//        // 서비스 메서드 호출
//        return houseService.findTwoRoomByLocationNear(point, distance, tradeType, minDeposit, maxDeposit, minRent, maxRent);
//    }

    /**
     * 길찾기 엔드포인트
     * URL 예: /house/direction?originLat=37.5665&originLng=126.9780&destLat=37.5511&destLng=126.9882
     * 반드시 네 개의 좌표 파라미터(originLat, originLng, destLat, destLng)가 포함되어야 함
     */
    @GetMapping(value="/direction", params = {"originLat", "originLng", "destLat", "destLng"})
    public ResponseEntity<Direction> getDirections(
            @RequestParam double originLat,
            @RequestParam double originLng,
            @RequestParam double destLat,
            @RequestParam double destLng) {
        try {
            // HouseService에서 Redis → MongoDB → API 호출 순으로 결과를 가져옴 (JsonNode)
            JsonNode resultNode = houseService.getOrFetchDirection(originLat, originLng, destLat, destLng);
            // JsonNode를 Direction 객체로 변환
            Direction direction = objectMapper.treeToValue(resultNode, Direction.class);
            return ResponseEntity.ok(direction);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

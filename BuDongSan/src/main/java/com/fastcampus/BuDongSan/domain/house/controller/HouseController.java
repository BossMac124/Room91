// src/main/java/com/fastcampus/BuDongSan/domain/house/controller/HouseController.java
package com.fastcampus.BuDongSan.domain.house.controller;

import com.fastcampus.BuDongSan.domain.house.dto.DirectionResponseDto;
import com.fastcampus.BuDongSan.domain.house.dto.HouseResponse;
import com.fastcampus.BuDongSan.domain.house.dto.TwoRoomResponse;
import com.fastcampus.BuDongSan.domain.house.entity.House;
import com.fastcampus.BuDongSan.domain.house.entity.TwoRoom;
import com.fastcampus.BuDongSan.domain.house.mapper.HouseMapper;
import com.fastcampus.BuDongSan.domain.house.mapper.TwoRoomMapper;
import com.fastcampus.BuDongSan.domain.house.service.HouseService;
import com.fastcampus.BuDongSan.domain.house.service.TwoRoomService;
import com.fastcampus.BuDongSan.global.common.dto.ApiResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Metrics;
import org.springframework.data.geo.Point;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/house")
@RequiredArgsConstructor
public class HouseController {

    private final HouseService houseService;
    private final TwoRoomService twoRoomService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<HouseResponse>>> getNearbyOneRoom(
            @RequestParam double lng,
            @RequestParam double lat,
            @RequestParam(defaultValue = "5") double radius,
            @RequestParam(required = false, name="tradeTypeCodes") List<String> tradeTypeCodes, // 호환
            @RequestParam(required = false, name="tradeTypes") List<String> tradeTypes,
            @RequestParam(required = false) Integer rentPrcMin,
            @RequestParam(required = false) Integer rentPrcMax,
            @RequestParam(required = false) Integer dealPrcMin,
            @RequestParam(required = false) Integer dealPrcMax
    ) throws JsonProcessingException {

        List<String> mergedTypes = (tradeTypes != null && !tradeTypes.isEmpty())
                ? tradeTypes : tradeTypeCodes;

        List<House> houses = houseService.findByLocationWithFilters(
                new Point(lng, lat),
                new Distance(radius, Metrics.KILOMETERS),
                mergedTypes, rentPrcMin, rentPrcMax, dealPrcMin, dealPrcMax
        );

        return ResponseEntity.ok(ApiResponse.ok(HouseMapper.toResponseList(houses)));
    }

    @GetMapping("/two")
    public ResponseEntity<ApiResponse<List<TwoRoomResponse>>> getNearbyTwoRoom(
            @RequestParam double lng,
            @RequestParam double lat,
            @RequestParam(defaultValue = "5") double radius,
            @RequestParam(required = false, name="tradeTypeCodes") List<String> tradeTypeCodes, // 호환
            @RequestParam(required = false, name="tradeTypes") List<String> tradeTypes,
            @RequestParam(required = false) Integer rentPrcMin,
            @RequestParam(required = false) Integer rentPrcMax,
            @RequestParam(required = false) Integer dealPrcMin,
            @RequestParam(required = false) Integer dealPrcMax
    ) throws JsonProcessingException {

        List<String> mergedTypes = (tradeTypes != null && !tradeTypes.isEmpty())
                ? tradeTypes : tradeTypeCodes;

        List<TwoRoom> rooms = twoRoomService.findTwoRoomWithFilters(
                new Point(lng, lat),
                new Distance(radius, Metrics.KILOMETERS),
                mergedTypes, rentPrcMin, rentPrcMax, dealPrcMin, dealPrcMax
        );

        return ResponseEntity.ok(ApiResponse.ok(TwoRoomMapper.toResponseList(rooms)));
    }

    @GetMapping("/direction")
    public ResponseEntity<ApiResponse<DirectionResponseDto>> getDirections(
            @RequestParam double originLat,
            @RequestParam double originLng,
            @RequestParam double destLat,
            @RequestParam double destLng) throws IOException {

        DirectionResponseDto dto = houseService.getOrFetchDirectionDto(
                originLat, originLng, destLat, destLng
        );
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }
}

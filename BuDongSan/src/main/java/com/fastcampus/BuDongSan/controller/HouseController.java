package com.fastcampus.BuDongSan.controller;

import com.fastcampus.BuDongSan.entity.House;
import com.fastcampus.BuDongSan.entity.TwoRoom;
import com.fastcampus.BuDongSan.dto.DirectionResponseDto;
import com.fastcampus.BuDongSan.service.HouseService;
import com.fastcampus.BuDongSan.service.TwoRoomService;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Metrics;
import org.springframework.data.geo.Point;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.List;

@RestController
@RequestMapping("/api/house")
@RequiredArgsConstructor
public class HouseController {

    private final HouseService houseService;
    private final TwoRoomService twoRoomService;

    @GetMapping
    public List<House> getNearbyOneRoom(
            @RequestParam double lng,
            @RequestParam double lat,
            @RequestParam(defaultValue = "3") double radius,
            @RequestParam(required = false) List<String> tradeTypeCodes,
            @RequestParam(required = false) Integer rentPrcMin,
            @RequestParam(required = false) Integer rentPrcMax,
            @RequestParam(required = false) Integer dealPrcMin,
            @RequestParam(required = false) Integer dealPrcMax
    ) throws JsonProcessingException {
        return houseService.findByLocationWithFilters(
                new Point(lng, lat),
                new Distance(radius, Metrics.KILOMETERS),
                tradeTypeCodes, rentPrcMin, rentPrcMax, dealPrcMin, dealPrcMax
        );
    }

    @GetMapping("/two")
    public List<TwoRoom> getNearbyTwoRoom(
            @RequestParam double lng,
            @RequestParam double lat,
            @RequestParam(defaultValue = "3") double radius,
            @RequestParam(required = false) List<String> tradeTypeCodes,
            @RequestParam(required = false) Integer rentPrcMin,
            @RequestParam(required = false) Integer rentPrcMax,
            @RequestParam(required = false) Integer dealPrcMin,
            @RequestParam(required = false) Integer dealPrcMax
    ) throws JsonProcessingException {
        return twoRoomService.findTwoRoomWithFilters(
                new Point(lng, lat),
                new Distance(radius, Metrics.KILOMETERS),
                tradeTypeCodes, rentPrcMin, rentPrcMax, dealPrcMin, dealPrcMax
        );
    }

    @GetMapping("/direction")
    public ResponseEntity<DirectionResponseDto> getDirections(
            @RequestParam double originLat,
            @RequestParam double originLng,
            @RequestParam double destLat,
            @RequestParam double destLng) {
        try {
            DirectionResponseDto dto = houseService.getOrFetchDirectionDto(
                    originLat, originLng, destLat, destLng
            );
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

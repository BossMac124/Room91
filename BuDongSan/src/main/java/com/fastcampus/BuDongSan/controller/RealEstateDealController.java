package com.fastcampus.BuDongSan.controller;

import com.fastcampus.BuDongSan.Entity.GeoLocation;
import com.fastcampus.BuDongSan.dto.RealEstateDealResponse;
import com.fastcampus.BuDongSan.service.KakaoMapService;
import com.fastcampus.BuDongSan.service.RealEstateDealService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deals")
public class RealEstateDealController {

    @Autowired
    private RealEstateDealService realEstateDealService;

    @Autowired
    private KakaoMapService kakaoMapService;

    @GetMapping("/district")
    public List<RealEstateDealResponse> getDealsByDistrict(@RequestParam String district) {
        return realEstateDealService.getDealsByDistrict(district);
    }

    @GetMapping("/geocoding")
    @ResponseBody
    public ResponseEntity<?> geocode(@RequestParam String address) {
        GeoLocation geo = kakaoMapService.getGeoLocation(address);

        if (geo == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("해당 주소를 찾을 수 없습니다.");
        }
        return ResponseEntity.ok(geo);
    }
}

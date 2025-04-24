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

    // 검색한 시군구 데이터 전체 조회
    @GetMapping()
    public List<RealEstateDealResponse> getDealsByDistrict(@RequestParam String district) {
        return realEstateDealService.getDealsByDistrict(district);
    }

    // 검색한 주소를 좌표로 변환
    @GetMapping("/geocoding")
    @ResponseBody
    public ResponseEntity<?> geocode(@RequestParam String address) {
        GeoLocation geo = kakaoMapService.getGeoLocation(address);

        // 변환 실패시 404에러 메세지와 함께 반환
        if (geo == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("해당 주소를 찾을 수 없습니다.");
        }
        return ResponseEntity.ok(geo);
    }

    // 시군구 리스트 가져오기
    @GetMapping("/district")
    public ResponseEntity<List<String>> getDistricts() {
        List<String> districts = realEstateDealService.getAllDistricts();
        return ResponseEntity.ok(districts);
    }

    // 선택한 시군구에 대한 법정동 리스트 가져오기
    @GetMapping("/district/{district}/neighborhood")
    public List<String> getNeighborhood(@PathVariable String district) {
        return realEstateDealService.getNeighborhoodByDistrict(district);
    }
}

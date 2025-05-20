package com.fastcampus.BuDongSan.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PointRequestDto {
    private double clusterLat;  // 클러스터의 중앙 위도
    private double clusterLng;   // 클러스터의 중앙 경도
    private double searchedLat;  // 사용자 검색 위도
    private double searchedLng;  // 사용자 검색 경도
}
 
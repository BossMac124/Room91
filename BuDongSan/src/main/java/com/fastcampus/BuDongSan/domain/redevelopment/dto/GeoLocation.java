package com.fastcampus.BuDongSan.domain.redevelopment.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class GeoLocation {
    private double latitude;    // 위도(북-남)
    private double longitude;   // 경도(동-서)
    private boolean approx;     // 근사치(동 중심 등) 여부

    public GeoLocation(double latitude, double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.approx = false;     // 기본은 "정확 좌표"
    }
}
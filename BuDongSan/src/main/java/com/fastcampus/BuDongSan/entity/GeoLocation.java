package com.fastcampus.BuDongSan.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class GeoLocation {
    private double latitude;    // 위도(북-남)
    private double longitude;   // 경도(동-서)
}
package com.fastcampus.BuDongSan.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LatLngDto {
    // 좌표 한 쌍을 담는 DTO
    private double lat;
    private double lng;
}

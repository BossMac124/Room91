package com.fastcampus.BuDongSan.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DirectionResponseDto {
    // 클라이언트에게 보내줄 데이터 구조
    private String distance;
    private String duration;
    private String polyline;
    private List<LatLngDto> pathCoords;
}

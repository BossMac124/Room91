package com.fastcampus.BuDongSan.domain.house.mapper;

import com.fastcampus.BuDongSan.domain.house.dto.HouseResponse;
import com.fastcampus.BuDongSan.domain.house.entity.House;

import java.util.List;

public final class HouseMapper {
    private HouseMapper() {}
    public static HouseResponse toResponse(House h) { return HouseResponse.from(h); }
    public static List<HouseResponse> toResponseList(List<House> list) {
        return list.stream().map(HouseResponse::from).toList();
    }
}
package com.fastcampus.BuDongSan.domain.house.mapper;

import com.fastcampus.BuDongSan.domain.house.dto.TwoRoomResponse;
import com.fastcampus.BuDongSan.domain.house.entity.TwoRoom;

import java.util.List;

public final class TwoRoomMapper {
    private TwoRoomMapper() {}
    public static TwoRoomResponse toResponse(TwoRoom t) { return TwoRoomResponse.from(t); }
    public static List<TwoRoomResponse> toResponseList(List<TwoRoom> list) {
        return list.stream().map(TwoRoomResponse::from).toList();
    }
}
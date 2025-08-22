// src/main/java/com/fastcampus/BuDongSan/domain/house/dto/TwoRoomResponse.java
package com.fastcampus.BuDongSan.domain.house.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fastcampus.BuDongSan.domain.house.entity.TwoRoom;

import java.time.LocalDate;

public record TwoRoomResponse(
        String id,
        String region,
        String articleName,
        String tradeTypeCode,
        String tradeTypeName,
        String buildingName,
        String floorInfo,
        Double area1,
        Double area2,
        Double latitude,
        Double longitude,
        String direction,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        LocalDate articleConfirmYmd,
        String rentPrc,
        String tagList,
        String articleFeatureDesc,
        String dealOrWarrantPrc,
        Integer elevatorCount,
        Integer sameAddrCnt,
        String sameAddrMinPrc,
        String realtorName,
        String cpid,
        String cpName,
        String cpPcArticleUrl
) {
    public static TwoRoomResponse from(TwoRoom t) {
        return new TwoRoomResponse(
                t.getId(),
                t.getRegion(),
                t.getArticleName(),
                t.getTradeTypeCode(),
                t.getTradeTypeName(),
                t.getBuildingName(),
                t.getFloorInfo(),
                t.getArea1(),
                t.getArea2(),
                t.getLatitude(),
                t.getLongitude(),
                t.getDirection(),
                t.getArticleConfirmYmd(),
                t.getRentPrc(),
                t.getTagList(),
                t.getArticleFeatureDesc(),
                t.getDealOrWarrantPrc(),
                t.getElevatorCount(),
                t.getSameAddrCnt(),
                t.getSameAddrMinPrc(),
                t.getRealtorName(),
                t.getCpid(),
                t.getCpName(),
                t.getCpPcArticleUrl()
        );
    }
}

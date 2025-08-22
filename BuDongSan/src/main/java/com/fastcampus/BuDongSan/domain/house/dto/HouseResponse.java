// src/main/java/com/fastcampus/BuDongSan/domain/house/dto/HouseResponse.java
package com.fastcampus.BuDongSan.domain.house.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fastcampus.BuDongSan.domain.house.entity.House;

import java.time.LocalDate;

public record HouseResponse(
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
    public static HouseResponse from(House h) {
        return new HouseResponse(
                h.getId(),
                h.getRegion(),
                h.getArticleName(),
                h.getTradeTypeCode(),
                h.getTradeTypeName(),
                h.getBuildingName(),
                h.getFloorInfo(),
                h.getArea1(),
                h.getArea2(),
                h.getLatitude(),
                h.getLongitude(),
                h.getDirection(),
                h.getArticleConfirmYmd(),
                h.getRentPrc(),
                h.getTagList(),
                h.getArticleFeatureDesc(),
                h.getDealOrWarrantPrc(),
                h.getElevatorCount(),
                h.getSameAddrCnt(),
                h.getSameAddrMinPrc(),
                h.getRealtorName(),
                h.getCpid(),
                h.getCpName(),
                h.getCpPcArticleUrl()
        );
    }
}

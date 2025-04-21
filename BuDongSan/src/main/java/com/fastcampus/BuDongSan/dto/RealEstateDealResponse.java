package com.fastcampus.BuDongSan.dto;

import com.fastcampus.BuDongSan.Entity.RealEstateDeal;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RealEstateDealResponse {

    private int dealYear;               // 연도
    private int dealMonth;              // 월
    private int dealDay;                // 일
    private String district;            // 시군구
    private String neighborhood;        // 법정동
    private String dealAmount;          // 거래 금액
    private String houseType;           // 주택 유형(아파트, 토지 매매, 연립 다세대, 단독 다가구)
    private String aptName;             // 이름
    private String jiBun;               // 지번
    private Integer floor;              // 층
    private Double excluUseAr;          // 전용 면적
    private Double plottageArea;        // 대지 면적
    private Double dealArea;            // 거래 면적
    private String jimok;               // 지목
    private String landUse;             // 용도 지역
    private String shareDealingType;    // 지분 거래 유형
    private String dealingGbn;          // 거래 구분
    private String dataType;            // 단독, 연립, 아파트 구분

    // 날짜를 LocalDate로 반환하는 메서드
    public LocalDate getDealDate() {
        return LocalDate.of(dealYear, dealMonth, dealDay);
    }

    // 변환 메서드 추가 (RealEstateDeal -> RealEstateDealResponse)
    public static RealEstateDealResponse convertToDto(RealEstateDeal deal) {
        return RealEstateDealResponse.builder()
                .dealYear(deal.getDealYear())
                .dealMonth(deal.getDealMonth())
                .dealDay(deal.getDealDay())
                .district(deal.getDistrict())
                .neighborhood(deal.getNeighborhood())
                .dealAmount(deal.getDealAmount())
                .houseType(deal.getHouseType())
                .aptName(deal.getAptName())
                .jiBun(deal.getJiBun())
                .floor(deal.getFloor())
                .excluUseAr(deal.getExcluUseAr())
                .plottageArea(deal.getPlottageArea())
                .dealArea(deal.getDealArea())
                .jimok(deal.getJimok())
                .landUse(deal.getLandUse())
                .shareDealingType(deal.getShareDealingType())
                .dealingGbn(deal.getDealingGbn())
                .dataType(deal.getDataType())
                .build();
    }
}

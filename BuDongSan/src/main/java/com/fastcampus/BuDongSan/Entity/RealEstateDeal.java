package com.fastcampus.BuDongSan.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "real_estate_deals")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class RealEstateDeal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int dealYear;               // 연도
    private int dealMonth;              // 월
    private int dealDay;                // 일
    private String district;            // 시군구
    private String neighborhood;        // 법정동
    private long dealAmount;            // 거래 금액
    private String houseType;           // 주택 유형(아파트, 토지 매매, 연립 다세대, 단독 다가구)
    private String aptName;             // 이름
    private String jibun;               // 지번
    private Integer floor;              // 층
    private Double excluUseAr;          // 전용 면적
    private Double plottageArea;        // 대지 면적
    private Double dealArea;            // 거래 면적
    private String jimok;               // 지목
    private String landUse;             // 용도 지역
    private String shareDealingType;    // 지분 거래 유형
    private String dealingGbn;          // 거래 구분
    private String dataType;            // 단독, 연립, 아파트 구분
}

package com.fastcampus.BuDongSan.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "TwoRoom")  // MongoDB 용
@JsonIgnoreProperties(ignoreUnknown = true)
@ToString
public class TwoRoom {

    @Id
    private String id;
    //지역
    private String region;
    //방타입(원룸, 투룸)
    private String articleName;
    //방타입코드(B1 원룸, B2 투룸)
    private String tradeTypeCode;
    //지불 유형
    private String tradeTypeName;
    //건물 이름(아파트는 몇동인지, 원룸은 원룸이라고 표시)
    private String buildingName;
    //매물 층
    private String floorInfo;
    //전체 면적
    private Double area1;
    //사용가능한 면적
    private Double area2;
    //경도
    private Double latitude;
    //위도
    private Double longitude;
    //GeoJSON 포맷의 좌표 정보
    @GeoSpatialIndexed(type = org.springframework.data.mongodb.core.index.GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint location;
    //방향
    private String direction;
    //등록 날짜
    private LocalDate articleConfirmYmd;
    //월세
    private String rentPrc;
    //건물 설명 요약
    private String tagList;
    //상세 설명
    private String articleFeatureDesc;
    //보증금
    private String dealOrWarrantPrc;
    //엘레베이터 갯수
    private Integer elevatorCount;
    //같은 매물 갯수
    private Integer sameAddrCnt;
    //같은 매물 갯수 최저 가격
    private String sameAddrMinPrc;
    //공인중개사
    private String realtorName;
    //매물등록사이트 아이디
    private String cpid;
    //매물등록사이트 이름
    private String cpName;
    //매물등록사이트 url
    private String cpPcArticleUrl;

    public Double getDepositAmount() {
        if (this.dealOrWarrantPrc != null) {
            // 문자열을 숫자 (예: "3억 4,000")로 변환하는 로직을 추가해야 함
            // 여기서는 예시로 직접 변환하는 방법을 보여줌
            return parseCurrencyToDouble(this.dealOrWarrantPrc);
        }
        return null;
    }

    public Double getRentAmount() {
        if (this.rentPrc != null) {
            return parseCurrencyToDouble(this.rentPrc);
        }
        return null;
    }

    private Double parseCurrencyToDouble(String currency) {
        // 예시: "3억 4,000" -> 34000000 으로 변환하는 로직 추가
        // 실제로는 더 복잡한 로직이 필요함 (예: "억", "만원" 등)
        return Double.parseDouble(currency.replace("억", "").replace(",", "").replace("만원", ""));
    }
}

package com.fastcampus.BuDongSan.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class RoomSearchRequest {
    private double lng;  // 경도
    private double lat;  // 위도
    private double radius = 3;  // 기본 반경 3km
    private String tradeType;  // "전세", "월세", "단기임대"
    private Double minDeposit;  // 보증금 최소값
    private Double maxDeposit;  // 보증금 최대값
    private Double minRent;  // 월세 최소값
    private Double maxRent;  // 월세 최대값

    public String getTradeType() {
        if (tradeType == null) {
            return "전세 + 월세 + 단기임대";  // 기본값 설정
        }
        return tradeType;
    }

    public Double getMinDeposit() {
        if (minDeposit == null) {
            return 0.0;  // 기본값 설정
        }
        return minDeposit;
    }

    public Double getMaxDeposit() {
        if (maxDeposit == null) {
            return 9999999999999999.0;  // 기본값 설정
        }
        return maxDeposit;
    }

    public Double getMinRent() {
        if (minRent == null) {
            return 0.0;  // 기본값 설정
        }
        return minRent;
    }
    public Double getMaxRent() {
        if (maxRent == null) {
            return 999999999999999.0;  // 기본값 설정
        }
        return maxRent;
    }
}

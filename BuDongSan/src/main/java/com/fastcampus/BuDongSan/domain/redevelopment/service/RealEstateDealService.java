package com.fastcampus.BuDongSan.domain.redevelopment.service;

import com.fastcampus.BuDongSan.domain.redevelopment.entity.RealEstateDeal;
import com.fastcampus.BuDongSan.domain.redevelopment.dto.PriceStatsDto;
import com.fastcampus.BuDongSan.domain.redevelopment.dto.RealEstateDealResponse;
import com.fastcampus.BuDongSan.domain.redevelopment.repository.RealEstateDealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RealEstateDealService {


    private final RealEstateDealRepository dealRepository;

    // 최소, 최대, 평균 거래금액 조회
    public PriceStatsDto getPriceStatsByNeighborhood(String district, String neighborhood) {
        List<Object[]> resultList = dealRepository.findPriceStatsByNeighborhood(district, neighborhood);
        Object[] result = resultList.get(0); // 첫 번째 row
        return new PriceStatsDto(
                ((Number) result[0]).longValue(),
                ((Number) result[1]).longValue(),
                ((Double) result[2]).longValue()       // 평균은 Double로 나올 수 있어서 형변환 필요
        );
    }

    // 시/군/구 중복 없이 조회
    public List<String> getAllDistricts() {
        return dealRepository.findDistinctDistricts();
    }

    // 검색한 시/군/구에 해당 하는 법정동 중복 없이 조회
    public List<String> getNeighborhoodByDistrict(String district) {
        return dealRepository.findNeighborhoodByDistrict(district);
    }

    // 검색한 법정 동에 대한 거래 내역 중복 없이 조회
    public List<RealEstateDealResponse> getDealsByDistrictAndNeighborhood(String district, String neighborhood) {
        List<RealEstateDeal> deals = dealRepository.findByDistrictAndNeighborhood(district, neighborhood);

        return deals.stream()
                .map(RealEstateDealResponse::convertToDto)
                .sorted(Comparator.comparing(RealEstateDealResponse::getDealDate).reversed())
                .toList();
    }

    public List<RealEstateDealResponse> getDealsByDistrict(String district) {
        List<RealEstateDeal> deals;

        if (district != null && !district.isEmpty()) {
            deals = dealRepository.findByDistrict(district);    // 특정 지역으로 필터링
        } else {
            deals = dealRepository.findAll();   // 지역이 없으면 모든 데이터 조회
        }

        return deals.stream()
                .map(RealEstateDealResponse::convertToDto) // Dto로 변환
                .sorted(Comparator.comparing(RealEstateDealResponse::getDealDate).reversed()) // 날짜 내림차순 정렬
                .toList(); // 결과 반환
    }

}

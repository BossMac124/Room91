package com.fastcampus.BuDongSan.domain.redevelopment.service;

import com.fastcampus.BuDongSan.domain.redevelopment.entity.RealEstateDeal;
import com.fastcampus.BuDongSan.domain.redevelopment.dto.PriceStatsDto;
import com.fastcampus.BuDongSan.domain.redevelopment.dto.RealEstateDealResponse;
import com.fastcampus.BuDongSan.domain.redevelopment.repository.RealEstateDealRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StopWatch;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RealEstateDealService {


    private final RealEstateDealRepository dealRepository;

    /**
     * [역할] 특정 (시/군/구, 법정동) 구간의 최소/최대/평균 거래금액을 조회
     */
    public PriceStatsDto getPriceStatsByNeighborhood(String district, String neighborhood) {
        List<Object[]> resultList = dealRepository.findPriceStatsByNeighborhood(district, neighborhood);
        Object[] result = resultList.get(0); // 첫 번째 row
        return new PriceStatsDto(
                ((Number) result[0]).longValue(),
                ((Number) result[1]).longValue(),
                ((Double) result[2]).longValue()       // 평균은 Double로 나올 수 있어서 형변환 필요
        );
    }

    /**
     * [역할] 시/군/구 목록을 중복 없이 조회
     */
    public List<String> getAllDistricts() {
        return dealRepository.findDistinctDistricts();
    }

    /**
     * [역할] 특정 시/군/구에 속한 법정동 목록을 중복 없이 조회
     */
    public List<String> getNeighborhoodByDistrict(String district) {
        return dealRepository.findNeighborhoodByDistrict(district);
    }

    /**
     * [역할] (시/군/구 + 법정동) 조건의 거래 내역을 DTO로 변환 후, 거래일 내림차순 정렬하여 반환
     */
    public List<RealEstateDealResponse> getDealsByDistrictAndNeighborhood(String district, String neighborhood) {
        StopWatch sw = new StopWatch("getDealsByDistrictAndNeighborhood");
        sw.start();

        List<RealEstateDeal> deals = dealRepository.findByDistrictAndNeighborhood(district, neighborhood);

        // 스트림 파이프라인: Entity → DTO 변환 → 거래일 기준 내림차순 정렬 → 리스트화
        List<RealEstateDealResponse> responses = deals.stream()
                .map(RealEstateDealResponse::convertToDto)
                .sorted(Comparator.comparing(RealEstateDealResponse::getDealDate).reversed())
                .toList();

        sw.stop();

        log.info("[{}] district={}, neighborhood={}, resultSize={}, took {} ms",
                sw.getId(), district, neighborhood, responses.size(), sw.getTotalTimeMillis());

        return responses;
    }

    /**
     * [역할] 시/군/구 단위로 거래 내역 조회
     */
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

    /**
     * [역할] PK로 단건 조회
     */
    public Optional<RealEstateDeal> findById(Long id) {
        return dealRepository.findById(id);
    }
}

package com.fastcampus.BuDongSan.service;

import com.fastcampus.BuDongSan.Entity.RealEstateDeal;
import com.fastcampus.BuDongSan.dto.RealEstateDealResponse;
import com.fastcampus.BuDongSan.repository.postgre.RealEstateDealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RealEstateDealService {

    @Autowired
    private RealEstateDealRepository dealRepository;

    public List<String> getAllDistricts() {
        return dealRepository.findDistinctDistricts();
    }

    public List<RealEstateDealResponse> getDealsByDistrict(String district) {
        List<RealEstateDeal> deals;

        if (district != null && !district.isEmpty()) {
            deals = dealRepository.findByDistrict(district);
        } else {
            deals = dealRepository.findAll();
        }

        return deals.stream()
                .map(RealEstateDealResponse::convertToDto) // Dto로 변환
                .sorted(Comparator.comparing(RealEstateDealResponse::getDealDate).reversed()) // 날짜 내림차순 정렬
                .toList(); // 결과 반환
    }

}

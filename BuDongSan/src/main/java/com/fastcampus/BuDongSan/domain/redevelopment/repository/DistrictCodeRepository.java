package com.fastcampus.BuDongSan.domain.redevelopment.repository;

import com.fastcampus.BuDongSan.domain.redevelopment.entity.DistrictCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DistrictCodeRepository extends JpaRepository<DistrictCode, Long> {
    boolean existsBySidoAndDistrictAndNeighborhood(String sido, String district, String neighborhood);
    Optional<DistrictCode> findBySidoAndDistrictAndNeighborhood(String sido, String district, String neighborhood);
}


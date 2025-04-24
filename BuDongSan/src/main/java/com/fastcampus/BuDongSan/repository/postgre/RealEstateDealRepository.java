package com.fastcampus.BuDongSan.repository.postgre;

import com.fastcampus.BuDongSan.Entity.RealEstateDeal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RealEstateDealRepository extends JpaRepository<RealEstateDeal, Long> {

    // 중복 없이 시/군/구 이름 조회
    @Query("SELECT DISTINCT r.district FROM RealEstateDeal r")
    List<String> findDistinctDistricts();

    // 선택한 시/군/구에 해당하는 법정동을 중복없이 조회
    @Query("SELECT DISTINCT r.neighborhood FROM RealEstateDeal r WHERE r.district = :district")
    List<String> findNeighborhoodByDistrict(String district);

    // 검색한 시/군/구에 대한 데이터 조회
    List<RealEstateDeal> findByDistrict(String district);
}
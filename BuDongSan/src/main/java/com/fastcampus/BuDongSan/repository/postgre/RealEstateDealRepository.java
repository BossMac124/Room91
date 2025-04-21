package com.fastcampus.BuDongSan.repository.postgre;

import com.fastcampus.BuDongSan.Entity.RealEstateDeal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RealEstateDealRepository extends JpaRepository<RealEstateDeal, Long> {

    @Query("SELECT DISTINCT r.district FROM RealEstateDeal r")
    List<String> findDistinctDistricts();

    List<RealEstateDeal> findByDistrict(String district);
}

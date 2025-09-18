package com.fastcampus.BuDongSan.domain.redevelopment.service;

import com.fastcampus.BuDongSan.domain.redevelopment.dto.GeoLocation;
import com.fastcampus.BuDongSan.domain.redevelopment.entity.RealEstateDeal;
import com.fastcampus.BuDongSan.domain.redevelopment.repository.DistrictCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GeoLocationService {
    private final KakaoMapService kakaoMapService;
    private final DistrictCodeRepository districtCodeRepo;

    public Optional<GeoLocation> locateDeal(RealEstateDeal d) {
        try {
            // 1차: 정확 주소
            String fullAddr = String.join(" ",
                    "서울특별시",
                    d.getDistrict() != null ? d.getDistrict() : "",
                    d.getNeighborhood() != null ? d.getNeighborhood() : "",
                    d.getJibun() != null ? d.getJibun() : "",
                    d.getAptName() != null ? d.getAptName() : ""
            ).trim().replaceAll("\\s+"," ");

            GeoLocation exact = kakaoMapService.getGeoLocation(fullAddr);
            if (exact != null) return Optional.of(exact);

            // 2차: 동 중심 좌표 (폴백)
            return districtCodeRepo.findBySidoAndDistrictAndNeighborhood(
                    "서울특별시", d.getDistrict(), d.getNeighborhood()
            ).map(dc -> new GeoLocation(
                    dc.getLatitude().doubleValue(),
                    dc.getLongitude().doubleValue(),
                    true // ✅ 폴백 좌표이므로 근사치 표시
            ));
        } catch (Exception e) {
            // ❌ 여기서 터지면 서버에러가 아니라 빈 Optional 반환
            return Optional.empty();
        }
    }
}

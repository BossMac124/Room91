package com.fastcampus.BuDongSan.domain.redevelopment.service;

import com.fastcampus.BuDongSan.domain.redevelopment.dto.GeoLocation;
import com.fastcampus.BuDongSan.domain.redevelopment.entity.RealEstateDeal;
import com.fastcampus.BuDongSan.domain.redevelopment.repository.DistrictCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GeocodeOrchestrator {
    private final KakaoMapService kakao;                // 주소 지오코딩
    private final KakaoLocalClient kakaoLocalClient;    // 키워드 검색(주민센터)
    private final DistrictCodeRepository districtRepo;  // 동 중심 캐시
    private final AddressNormalizer normalizer;

    public Optional<GeoLocation> locate(RealEstateDeal d, String sido) {
        String dongFull = normalizer.normalizeDong(d.getDistrict(), d.getNeighborhood());
        List<String> jibunVariants = normalizer.buildJibunVariants(d.getJibun());

        // 1) 정확 주소 (건물명 포함)
        String baseWithName = (sido + " " + dongFull + " " +
                (d.getJibun() == null ? "" : d.getJibun()) + " " +
                (d.getAptName() == null ? "" : d.getAptName()))
                .replaceAll("\\s+"," ").trim();
        GeoLocation exact = kakao.getGeoLocation(baseWithName);
        if (exact != null) return Optional.of(exact);

        // 2) 지번 변형 시퀀스
        for (String j : jibunVariants) {
            String addr = (sido + " " + dongFull + " " + j).replaceAll("\\s+"," ").trim();
            GeoLocation g = kakao.getGeoLocation(addr);
            if (g != null) return Optional.of(g);
        }

        // 3) 동 중심 캐시
        Optional<GeoLocation> center = districtRepo
                .findBySidoAndDistrictAndNeighborhood(sido, d.getDistrict(), d.getNeighborhood())
                .map(dc -> new GeoLocation(dc.getLatitude().doubleValue(), dc.getLongitude().doubleValue()));
        if (center.isPresent()) return center;

        // 4) 키워드 폴백 (동 주민센터/행정복지센터)
        for (String kw : List.of(d.getNeighborhood() + " 주민센터", d.getNeighborhood() + " 행정복지센터")) {
            Optional<double[]> hit = kakaoLocalClient.searchKeyword(kw);
            if (hit.isPresent()) {
                double[] arr = hit.get();
                return Optional.of(new GeoLocation(arr[0], arr[1]));
            }
        }
        return Optional.empty();
    }
}


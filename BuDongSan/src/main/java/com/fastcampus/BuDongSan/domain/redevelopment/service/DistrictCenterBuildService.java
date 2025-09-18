package com.fastcampus.BuDongSan.domain.redevelopment.service;

import com.fastcampus.BuDongSan.domain.redevelopment.entity.DistrictCode;
import com.fastcampus.BuDongSan.domain.redevelopment.repository.DistrictCodeRepository;
import com.fastcampus.BuDongSan.domain.redevelopment.repository.RealEstateDealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DistrictCenterBuildService {
    private final KakaoLocalClient kakao;
    private final RealEstateDealRepository dealRepo;
    private final DistrictCodeRepository districtCodeRepo;

    @Transactional
    public int buildForSeoul() {
        // 1) 유니크 (시군구, 법정동) 목록
        List<Object[]> pairs = dealRepo.findDistinctDistrictNeighborhood();
        int saved = 0;

        for (Object[] p : pairs) {
            String district = (String) p[0];
            String neighborhood = (String) p[1];
            String sido = "서울특별시";

            // 이미 있으면 스킵
            if (districtCodeRepo.existsBySidoAndDistrictAndNeighborhood(sido, district, neighborhood)) continue;

            // 2) 1차: 주소 지오코딩
            String addr = String.join(" ", List.of(sido, district, neighborhood));
            Optional<double[]> geo = kakao.geocodeAddress(addr);

            String source = "KAKAO_ADDR";

            // 3) 실패 시: 키워드 검색 (주민센터/행정복지센터)
            if (geo.isEmpty()) {
                String q1 = neighborhood + " 주민센터";
                geo = kakao.searchKeyword(q1);
                source = "KAKAO_KEYWORD";

                if (geo.isEmpty()) {
                    String q2 = neighborhood + " 행정복지센터";
                    geo = kakao.searchKeyword(q2);
                }
            }

            if (geo.isPresent()) {
                double lat = geo.get()[0], lng = geo.get()[1];
                districtCodeRepo.save(new DistrictCode(null, sido, district, neighborhood,
                        BigDecimal.valueOf(lat), BigDecimal.valueOf(lng), source));
                saved++;
            }

            // 간단 레이트 리밋 (쿼터 보호)
            try { Thread.sleep(120); } catch (InterruptedException ignored) {}
        }
        return saved;
    }
}


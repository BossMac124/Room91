package com.fastcampus.BuDongSan.service;


import com.fastcampus.BuDongSan.Entity.House;
import com.fastcampus.BuDongSan.Entity.SearchCount;
import com.fastcampus.BuDongSan.repository.mongo.MongoOneRoomRepository;
import com.fastcampus.BuDongSan.repository.mongo.MongoSearchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class SearchService {

    private final MongoOneRoomRepository roomRepo;
    private final MongoSearchRepository countRepo;

    /**
     * 상세 조회 + 조회수 1 증가
     */
    public House getRoomDetail(String id) {
        House room = roomRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("매물을 찾을 수 없습니다. id=" + id));

        // countRepo는 따로 만든 room_search_count 컬렉션용 리포지토리
        SearchCount sc = countRepo.findByRoomId(id)
                .orElseGet(() -> new SearchCount(id, 0));
        sc.setCount(sc.getCount() + 1);
        countRepo.save(sc);

        return room;
    }

    /**
     * 조회수 기준 Top5 매물
     */
    public List<House> getTopSearch() {
        return countRepo.findTop5ByOrderByCountDesc().stream()
                .map(sc -> roomRepo.findById(sc.getRoomId()).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    /**
     * 구별 최저가 Top5 매물
     */
    public List<House> getLowestPriceByGu(String gu) {
        return roomRepo.findTop5ByGuOrderByRentPrcAsc(gu);
    }
}

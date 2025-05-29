// RoomController.java
package com.fastcampus.BuDongSan.controller;

import com.fastcampus.BuDongSan.Entity.House;
import com.fastcampus.BuDongSan.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService roomService;

    /** 상세 조회 (조회수 증가) */
    @GetMapping("/{id}")
    public ResponseEntity<House> getRoomDetail(@PathVariable String id) {
        House room = roomService.getRoomDetail(id);
        return ResponseEntity.ok(room);
    }

    /** 조회수 많은 매물 Top5 */
    @GetMapping("/top-search")
    public ResponseEntity<List<House>> getTopSearch() {
        return ResponseEntity.ok(roomService.getTopSearch());
    }

    /** 구별 최저가 매물 Top5 */
    @GetMapping("/lowest-price")
    public ResponseEntity<List<House>> getLowestPrice(@RequestParam String gu) {
        return ResponseEntity.ok(roomService.getLowestPriceByGu(gu));
    }
}

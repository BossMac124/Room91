package com.fastcampus.BuDongSan.Entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "room_search_count")
public class SearchCount {
    @Id
    private String id;
    private String roomId;  // OneRoom.id와 매핑
    private int count;      // 조회수

    public SearchCount(String roomId, int count) {
        this.roomId = roomId;
        this.count = count;
    }
}

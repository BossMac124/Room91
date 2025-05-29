package com.fastcampus.BuDongSan.repository.mongo;


import com.fastcampus.BuDongSan.Entity.SearchCount;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface MongoSearchRepository extends MongoRepository<SearchCount, String> {
    Optional<SearchCount> findByRoomId(String roomId);
    List<SearchCount> findTop5ByOrderByCountDesc();
}

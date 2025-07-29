package com.fastcampus.BuDongSan.repository.mongo;

import com.fastcampus.BuDongSan.entity.Direction;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoDirectionRepository extends MongoRepository<Direction, String> {
}

package com.fastcampus.BuDongSan.domain.house.repository;

import com.fastcampus.BuDongSan.domain.house.entity.Direction;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoDirectionRepository extends MongoRepository<Direction, String> {
}

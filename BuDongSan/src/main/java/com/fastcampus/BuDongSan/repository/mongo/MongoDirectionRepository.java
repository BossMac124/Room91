package com.fastcampus.BuDongSan.repository.mongo;

import com.fastcampus.BuDongSan.Entity.Direction;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface MongoDirectionRepository extends MongoRepository<Direction, String> {
}

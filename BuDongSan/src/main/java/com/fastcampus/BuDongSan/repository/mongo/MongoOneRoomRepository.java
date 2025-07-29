package com.fastcampus.BuDongSan.repository.mongo;

import com.fastcampus.BuDongSan.entity.House;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MongoOneRoomRepository extends MongoRepository<House, String> {
    Optional<House> findByRegionAndArticleName(String region, String articleName);

    List<House> findByRegion(String region);

    List<House> findByLocationNear(Point point, Distance distance);
}

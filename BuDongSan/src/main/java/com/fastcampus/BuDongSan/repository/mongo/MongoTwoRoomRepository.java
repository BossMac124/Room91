package com.fastcampus.BuDongSan.repository.mongo;

import com.fastcampus.BuDongSan.entity.TwoRoom;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MongoTwoRoomRepository extends MongoRepository<TwoRoom, String> {
    Optional<TwoRoom> findByRegionAndArticleName(String region, String articleName);

    List<TwoRoom> findByRegion(String region);

    List<TwoRoom> findByLocationNear(Point point, Distance distance);

    // tradeTypeName 필터링
    List<TwoRoom> findByTradeTypeNameIn(List<String> tradeTypes);

    // 가격 필터링
    @Aggregation(pipeline = {
            "{ '$match': { 'dealOrWarrantPrc': { $gte: ?0, $lte: ?1 }, 'rentPrc': { $gte: ?2, $lte: ?3 } } }"
    })
    List<TwoRoom> findByDepositAndRentRangeWithAggregation(
            double minDeposit, double maxDeposit, double minRent, double maxRent);
}

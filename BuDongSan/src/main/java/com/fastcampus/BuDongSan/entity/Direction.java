package com.fastcampus.BuDongSan.entity;

import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "directions")
@Getter
@Setter
public class Direction {
    @Id
    private String id;

    // 출발지(회사)
    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint origin;

    // 도착지
    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint destination;

    // 거리
    private String distance;

    // 소요시간
    private String duration;

    // 경로
    private String polyline;

    // 경로 설명
    private String summary;

    // 저장 시각
    private Instant createdAt;
}

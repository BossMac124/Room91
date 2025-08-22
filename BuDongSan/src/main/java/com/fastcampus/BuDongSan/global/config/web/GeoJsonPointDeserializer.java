package com.fastcampus.BuDongSan.global.config.web;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import java.io.IOException;

public class GeoJsonPointDeserializer extends StdDeserializer<GeoJsonPoint> {

    public GeoJsonPointDeserializer() {
        this(null);
    }

    public GeoJsonPointDeserializer(Class<?> vc) {
        super(vc);
    }

    @Override
    public GeoJsonPoint deserialize(JsonParser jp, DeserializationContext ctxt)
            throws IOException, JsonProcessingException {
        JsonNode node = jp.getCodec().readTree(jp);
        // JSON 형식이 { "type": "Point", "coordinates": [lng, lat] } 임을 가정.
        JsonNode coords = node.get("coordinates");
        if (coords != null && coords.isArray() && coords.size() >= 2) {
            double lng = coords.get(0).asDouble();
            double lat = coords.get(1).asDouble();
            return new GeoJsonPoint(lng, lat);
        }
        return null;  // 또는 예외 던지기
    }
}

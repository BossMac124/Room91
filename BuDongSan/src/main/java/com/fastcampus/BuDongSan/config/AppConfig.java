package com.fastcampus.BuDongSan.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();

        // 커스텀 모듈 생성 및 등록
        SimpleModule module = new SimpleModule();
        module.addDeserializer(GeoJsonPoint.class, new GeoJsonPointDeserializer());
        mapper.registerModule(module);

        // 필요한 다른 모듈도 등록
        mapper.findAndRegisterModules();
        return mapper;
    }
}

package com.fastcampus.BuDongSan.global.config.cache;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        // Key/Value 직렬화 방식
        template.setKeySerializer(new StringRedisSerializer());                // Redis의 키를 사람이 읽을 수 있는 문자열로 저장
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer()); // 값(Object)을 JSON으로 직렬화/역직렬화. 다양한 객체 저장 가능
        return template;
    }

}

package com.fastcampus.BuDongSan.config;

import lombok.Getter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Configuration
@ConfigurationProperties(prefix = "kakao")
public class KakaoMapConfig {
    private String restApiKey;

    public void setRestApiKey(String restApiKey) {
        this.restApiKey = restApiKey;
    }
}

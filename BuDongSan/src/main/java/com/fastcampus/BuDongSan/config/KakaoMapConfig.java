package com.fastcampus.BuDongSan.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter @Setter
@Configuration
@ConfigurationProperties(prefix = "kakao")
public class KakaoMapConfig {
    private String restApiKey;
    private String jsApiKey;

}

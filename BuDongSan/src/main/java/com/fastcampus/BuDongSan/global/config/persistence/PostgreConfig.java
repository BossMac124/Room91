package com.fastcampus.BuDongSan.global.config.persistence;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(basePackages = "com.fastcampus.BuDongSan.domain")  // ✅ 새 경로
@EntityScan(basePackages = "com.fastcampus.BuDongSan.domain")             // ✅ 엔티티 스캔
public class PostgreConfig {
}

package com.fastcampus.BuDongSan.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(basePackages = "com.fastcampus.BuDongSan.repository.postgre")
public class PostgreConfig {
}

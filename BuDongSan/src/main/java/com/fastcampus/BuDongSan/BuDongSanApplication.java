package com.fastcampus.BuDongSan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.fastcampus.BuDongSan.repository.jpa") // 👈 JPA는 따로
public class BuDongSanApplication {

	public static void main(String[] args) {
		SpringApplication.run(BuDongSanApplication.class, args);
	}

}

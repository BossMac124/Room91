package com.fastcampus.BuDongSan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = {
		"com.fastcampus.BuDongSan.repository.mongo",
		"com.fastcampus.BuDongSan.repository.postgre" // 👈 이거 추가만 하면 해결!
})
@EnableJpaAuditing
public class BuDongSanApplication {

	public static void main(String[] args) {
		SpringApplication.run(BuDongSanApplication.class, args);
	}

}

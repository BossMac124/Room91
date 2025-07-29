package com.fastcampus.BuDongSan.config;

import org.springframework.boot.web.servlet.server.CookieSameSiteSupplier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CookieConfig {

    @Bean
    public CookieSameSiteSupplier cookieSameSiteSupplier() {
        // ✅ SameSite=None, Secure 설정을 통해 쿠키가 크로스도메인에서도 작동
        return CookieSameSiteSupplier.ofNone().whenHasName("JSESSIONID");
    }
}

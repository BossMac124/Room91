    package com.fastcampus.BuDongSan.global.config.security;

    import lombok.RequiredArgsConstructor;
    import org.springframework.context.annotation.Bean;
    import org.springframework.context.annotation.Configuration;
    import org.springframework.http.HttpMethod;
    import org.springframework.security.config.annotation.web.builders.HttpSecurity;
    import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
    import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
    import org.springframework.security.web.SecurityFilterChain;
    import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
    import org.springframework.web.cors.CorsConfiguration;
    import org.springframework.web.cors.CorsConfigurationSource;
    import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

    import java.util.List;

    @Configuration
    @EnableWebSecurity
    @RequiredArgsConstructor
    public class SecurityConfig {

        private final JwtTokenProvider jwtTokenProvider;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http
                    .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                    .csrf(AbstractHttpConfigurer::disable)
                    .authorizeHttpRequests(auth -> auth
                            // CORS preflight 허용
                            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                            // 🔓 회원가입, 로그인은 누구나 가능
                            .requestMatchers("/api/users/register", "/api/users/login").permitAll()

                            // 🔓 공지/FAQ 조회는 GET만 가능
                            .requestMatchers(HttpMethod.GET, "/api/notice/**").permitAll()
                            .requestMatchers(HttpMethod.GET, "/api/faq/**").permitAll()

                            // 🔓 정적 리소스
                            .requestMatchers("/uploads/**").permitAll()

                            // 🔐 관리자만 가능
                            .requestMatchers("/api/notice/**", "/api/faq/**").hasRole("ADMIN")

                            // 🔒 그 외 모든 요청 누구나 가능
                            .anyRequest().permitAll()
                    )
                    .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);
            return http.build();
        }

//      ✅ CORS 설정
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
            return request -> {
                String origin = request.getHeader("Origin");
                String method = request.getMethod();
                String uri = request.getRequestURI();

                System.out.println("===== CORS CHECK =====");
                System.out.println("Origin: " + origin);
                System.out.println("Method: " + method);
                System.out.println("URI: " + uri);
                System.out.println("======================");

                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOriginPatterns(List.of(
                        "https://*.room-91.com",
                        "http://localhost:*"
                ));
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
                config.setAllowCredentials(false);

                return config;
            };
        }
    }
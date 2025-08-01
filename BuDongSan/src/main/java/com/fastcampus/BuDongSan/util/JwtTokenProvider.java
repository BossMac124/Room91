package com.fastcampus.BuDongSan.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final String SECRET_KEY = "MyJwtSecretKeyMyJwtSecretKeyMyJwtSecretKey"; // 256bit 이상
    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 24; // 24시간

    private final Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    // 토큰 생성
    public String generateToken(String username, String nickname, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("nickname", nickname)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // 토큰에서 사용자 이름 추출
    public String getUsername(String token) {
        return parseClaims(token).getSubject();
    }
    public String getRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    public String getNickname(String token) {
        return parseClaims(token).get("nickname", String.class);
    }

    // 토큰 유효성 검사
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}

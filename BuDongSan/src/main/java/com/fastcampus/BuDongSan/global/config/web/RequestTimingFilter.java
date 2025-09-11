package com.fastcampus.BuDongSan.global.config.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
public class RequestTimingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        long start = System.nanoTime();
        try {
            chain.doFilter(req, res);
        } finally {
            long tookMs = (System.nanoTime() - start) / 1_000_000;
            // 메서드, URI, 상태코드, 소요시간(ms)
            log.info("HTTP {} {} -> {} ({} ms)", req.getMethod(), req.getRequestURI(), res.getStatus(), tookMs);
        }
    }
}

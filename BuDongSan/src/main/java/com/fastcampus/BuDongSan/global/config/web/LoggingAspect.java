package com.fastcampus.BuDongSan.global.config.web;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
public class LoggingAspect {

    @Around("@annotation(LogExecutionTime)")
    public Object logTime(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.nanoTime();
        try {
            return pjp.proceed();
        } finally {
            long tookMs = (System.nanoTime() - start) / 1_000_000;
            log.info("EXEC {}.{} took {} ms",
                    pjp.getSignature().getDeclaringType().getSimpleName(),
                    pjp.getSignature().getName(),
                    tookMs);
        }
    }
}

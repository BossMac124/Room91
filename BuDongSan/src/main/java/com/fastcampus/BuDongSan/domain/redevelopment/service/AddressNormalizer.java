package com.fastcampus.BuDongSan.domain.redevelopment.service;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class AddressNormalizer {

    public String normalizeDong(String district, String neighborhood) {
        String dong = neighborhood == null ? "" : neighborhood.trim();
        if (!dong.endsWith("동") && !dong.endsWith("읍") && !dong.endsWith("면") && !dong.endsWith("리")) {
            dong = dong + "동";
        }
        return (district + " " + dong).replaceAll("\\s+", " ").trim();
    }

    public List<String> buildJibunVariants(String rawJibun) {
        if (rawJibun == null || rawJibun.isBlank()) return List.of();
        String j = rawJibun.replaceAll("[\\(\\)\\[\\]]", " ")
                .replaceAll("번지", " ")
                .replaceAll("\\s+", " ")
                .trim();

        boolean isSan = j.startsWith("산");
        String pure = j.replaceFirst("^산\\s*", "").trim();

        String[] parts = pure.split("-");
        String main = parts[0];
        String sub  = parts.length > 1 ? parts[1] : null;

        List<String> variants = new ArrayList<>();
        // 기본형
        variants.add((isSan ? "산 " : "") + pure);
        // 번지 표현
        variants.add((isSan ? "산 " : "") + main + "번지" + (sub != null ? " " + sub : ""));
        variants.add((isSan ? "산 " : "") + main + (sub != null ? "-" + sub : "") + "번지");
        // 본번만
        variants.add((isSan ? "산 " : "") + main);
        variants.add(main + (sub != null ? "-" + sub : "")); // 산 제거형도 시도
        // 서브 0 제거
        if ("0".equals(sub)) variants.add(main);

        return variants.stream().distinct().toList();
    }
}


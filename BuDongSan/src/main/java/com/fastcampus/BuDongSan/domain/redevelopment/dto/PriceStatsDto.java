package com.fastcampus.BuDongSan.domain.redevelopment.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class PriceStatsDto {
    private long min;
    private long max;
    private double avg;
}

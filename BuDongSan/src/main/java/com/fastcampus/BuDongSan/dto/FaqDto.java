package com.fastcampus.BuDongSan.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FaqDto {

    private Long id;
    private String question;
    private String answer;
    private String category;
    private Boolean active;
    private Long createdAt;
    private Long updatedAt;
}
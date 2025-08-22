package com.fastcampus.BuDongSan.domain.faq.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Faq {

    @Id
    @GeneratedValue
    private Long id;
    private String question;

    @Column(columnDefinition = "TEXT")  // CKEditor를 적용하기 위해
    private String answer;

    private String category;    // FAQ 카테고리
    private Boolean active = true; // 활성여부
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
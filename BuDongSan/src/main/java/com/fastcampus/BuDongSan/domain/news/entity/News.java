package com.fastcampus.BuDongSan.domain.news.entity;

import com.fastcampus.BuDongSan.global.common.base.BaseEntity;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "refined_news")
@Data
public class News extends BaseEntity {
    
    @Column(name = "news_text", columnDefinition = "text")
    private String newsText;

}
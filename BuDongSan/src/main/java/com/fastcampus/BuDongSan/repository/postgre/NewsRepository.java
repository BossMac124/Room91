package com.fastcampus.BuDongSan.repository.postgre;

import com.fastcampus.BuDongSan.Entity.News;
import org.springframework.data.jpa.repository.JpaRepository;


public interface NewsRepository extends JpaRepository<News, Long> {
}

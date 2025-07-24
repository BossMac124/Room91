package com.fastcampus.BuDongSan.repository.postgre;

import com.fastcampus.BuDongSan.Entity.News;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NewsRepository extends JpaRepository<News, Long> {
}

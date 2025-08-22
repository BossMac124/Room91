package com.fastcampus.BuDongSan.domain.faq.repository;

import com.fastcampus.BuDongSan.domain.faq.entity.Faq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaqRepository extends JpaRepository<Faq, Long> {

    List<Faq> findByCategory(String category);
}

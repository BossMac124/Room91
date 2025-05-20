package com.fastcampus.BuDongSan.repository.postgre;

import com.fastcampus.BuDongSan.Entity.Faq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaqRepository extends JpaRepository<Faq, Long> {

    List<Faq> findByCategory(String category);

    List<Faq> findByQuestionKeyword(String keyword);
}

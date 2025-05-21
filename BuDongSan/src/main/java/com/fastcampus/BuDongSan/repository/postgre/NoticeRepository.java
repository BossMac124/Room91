package com.fastcampus.BuDongSan.repository.postgre;


import com.fastcampus.BuDongSan.Entity.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {

    Page<Notice> findByTitleContaining(String keyword, Pageable pageable);
    Page<Notice> findByContentContaining(String keyword, Pageable pageable);
    Page<Notice> findByTitleContainingOrContentContaining(String keyword1, String keyword2, Pageable pageable);
}

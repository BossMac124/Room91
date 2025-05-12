package com.fastcampus.BuDongSan.repository.postgre;


import com.fastcampus.BuDongSan.Entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
}

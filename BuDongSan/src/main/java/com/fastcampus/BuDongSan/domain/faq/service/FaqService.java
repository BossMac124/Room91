package com.fastcampus.BuDongSan.domain.faq.service;

import com.fastcampus.BuDongSan.domain.faq.entity.Faq;
import com.fastcampus.BuDongSan.domain.faq.dto.FaqDto;
import com.fastcampus.BuDongSan.domain.faq.repository.FaqRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class FaqService {

    private final FaqRepository faqRepository;

    // Created
    public FaqDto createFaq(FaqDto faqDto) {
        // 1. Dto -> Entity
        Faq faq = new Faq();
        faq.setQuestion(faqDto.getQuestion());
        faq.setAnswer(faqDto.getAnswer());
        faq.setCategory(faqDto.getCategory());
        faq.setActive(true);

        // 2. 저장하기(만든 저 faq를 포장하기)
        Faq savedFaq = faqRepository.save(faq);

        // 3. Entiy -> Dto로 변환
        FaqDto savedFaqDto = new FaqDto();
        savedFaqDto.setId(savedFaq.getId());
        savedFaqDto.setQuestion(savedFaq.getQuestion());
        savedFaqDto.setAnswer(savedFaq.getAnswer());
        savedFaqDto.setCategory(savedFaq.getCategory());
        savedFaqDto.setActive(true);
        savedFaqDto.setCreatedAt(savedFaq.getCreatedAt());
        savedFaqDto.setUpdatedAt(savedFaq.getUpdatedAt());

        // 4. 그 Dto를 return하기
        return savedFaqDto;
    }

    // ReadList
    @Transactional(readOnly = true)
    public Page<FaqDto> getFaqList(int page, int size) {
        // 1. 페이저블 생성
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return faqRepository.findAll(pageable)
                .map(entity -> new FaqDto(  // 생성자 호출
                        entity.getId(),
                        entity.getQuestion(),
                        entity.getAnswer(),
                        entity.getCategory(),
                        entity.getActive(),
                        entity.getCreatedAt(),
                        entity.getUpdatedAt()
                ));
    }

    // ReadDetail
    @Transactional(readOnly = true)
    public FaqDto getFaqDetail(Long id) {
        return faqRepository.findById(id)
                .map(entity -> {
                    FaqDto faqDto = new FaqDto();   // 빈 DTO생성 후 setter 호출
                    faqDto.setId(entity.getId());
                    faqDto.setQuestion(entity.getQuestion());
                    faqDto.setAnswer(entity.getAnswer());
                    faqDto.setCategory(entity.getCategory());
                    faqDto.setActive(entity.getActive());
                    faqDto.setCreatedAt(entity.getCreatedAt());
                    faqDto.setUpdatedAt(entity.getUpdatedAt());
                    return faqDto;
                })
                .orElseThrow(() -> new EntityNotFoundException("FAQ Id를 찾을 수 없습니다 : " + id));
    }

    // Update
    public FaqDto updateFaq(Long id, FaqDto faqDto) {
        // 1. id 조회하기 (=엔티티 가져오기)
        Faq faq = faqRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FAQ id를 찾을 수 없습니다." + id));

        // 2. Dto에 받은 값들로 Entity에 값 수정
        faq.setQuestion(faqDto.getQuestion());
        faq.setAnswer(faqDto.getAnswer());
        faq.setCategory(faqDto.getCategory());
        faq.setActive(faqDto.getActive());

        // 3. 엔티티 -> Dto변환
        return new FaqDto(
                faq.getId(),
                faq.getQuestion(),
                faq.getAnswer(),
                faq.getCategory(),
                faq.getActive(),
                faq.getCreatedAt(),
                faq.getUpdatedAt()  // @PreUpdate가 세팅해준 값
        );
    }

    // delete One
    public void deleteFaq(Long id) {
        // 1. id 조회하기
        Faq faq = faqRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FAQ id를 찾을 수 없습니다." + id));

        // 2. 삭제하기
        faqRepository.delete(faq);
    }

    // deleteAll
    public void deleteAllFaq() {
        faqRepository.deleteAll();
    }

}

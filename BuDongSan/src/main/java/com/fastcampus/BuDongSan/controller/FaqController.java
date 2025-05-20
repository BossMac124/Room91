package com.fastcampus.BuDongSan.controller;

import com.fastcampus.BuDongSan.dto.FaqDto;
import com.fastcampus.BuDongSan.service.FaqService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/faq")
@RequiredArgsConstructor
public class FaqController {

    private final FaqService faqService;

    @PostMapping("/create")
    public ResponseEntity<FaqDto> addFaq(@RequestBody FaqDto faqDto) {
        FaqDto createFaq = faqService.createFaq(faqDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createFaq);
    }

    @GetMapping
    public ResponseEntity<Page<FaqDto>> getFaqList(@RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "10") int size) {
        Page<FaqDto> getFaqPage = faqService.getFaqList(page, size);
        return ResponseEntity.ok(getFaqPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FaqDto> getFaqOne(@PathVariable Long id) {
        FaqDto getFaq = faqService.getFaqDetail(id);
        return ResponseEntity.ok(getFaq);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FaqDto> updateFaq(@PathVariable Long id,
                                            @RequestBody FaqDto faqDto) {
        FaqDto updateFaq = faqService.updateFaq(id, faqDto);
        return ResponseEntity.ok(updateFaq);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delFaq(@PathVariable Long id) {
        faqService.deleteFaq(id);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delAllFaq() {
        faqService.deleteAllFaq();
    }

}

package com.fastcampus.BuDongSan.controller;

import com.fastcampus.BuDongSan.dto.FaqDto;
import com.fastcampus.BuDongSan.service.FaqService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/faq")
@RequiredArgsConstructor
public class FaqController {

    private final FaqService faqService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<FaqDto> addFaq(@RequestBody FaqDto faqDto, HttpServletRequest request) {
        HttpSession session = request.getSession();
        System.out.println("✅ 세션 생성됨: " + session.getId());
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

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<FaqDto> updateFaq(@PathVariable Long id,
                                            @RequestBody FaqDto faqDto) {
        FaqDto updateFaq = faqService.updateFaq(id, faqDto);
        return ResponseEntity.ok(updateFaq);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delFaq(@PathVariable Long id) {
        faqService.deleteFaq(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delAllFaq() {
        faqService.deleteAllFaq();
    }

}

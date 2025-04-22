package com.fastcampus.BuDongSan.controller;

import com.fastcampus.BuDongSan.dto.RealEstateDealResponse;
import com.fastcampus.BuDongSan.service.RealEstateDealService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class DealViewController {

    @Autowired
    private RealEstateDealService dealService;

    @GetMapping("/deals")
    public String showDeals(@RequestParam(required = false) String district, Model model) {
        List<String> districts = dealService.getAllDistricts();
        List<RealEstateDealResponse> deals = dealService.getDealsByDistrict(district);

        model.addAttribute("districts", districts);
        model.addAttribute("selectedDistrict", district);
        model.addAttribute("deals", deals);
        return "deals";
    }

    @GetMapping("/geocodeMap")
    public String showGeocodingPage() {
        return "geocoding";
    }
}

package com.fastcampus.BuDongSan.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    @GetMapping("/")
    public String oneRoomPage() {
        return "index.html"; // static/index.html 반환
    }

    @GetMapping("/two")
    public String twoRoomPage() {
        return "two.html"; // static/two.html 반환
    }
}

package com.fastcampus.BuDongSan.controller;

import com.fastcampus.BuDongSan.dto.UserDto;
import com.fastcampus.BuDongSan.entity.User;
import com.fastcampus.BuDongSan.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 회원가입
    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody UserDto userDto) {
        User newUser = userService.register(userDto);
        return ResponseEntity.ok(newUser);
    }
}

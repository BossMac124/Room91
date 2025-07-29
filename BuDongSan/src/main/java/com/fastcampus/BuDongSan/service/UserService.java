package com.fastcampus.BuDongSan.service;

import com.fastcampus.BuDongSan.dto.UserDto;
import com.fastcampus.BuDongSan.entity.User;
import com.fastcampus.BuDongSan.repository.postgre.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User register(UserDto dto) {
        if (userRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        return userRepository.save(dto.toEntity(passwordEncoder));
    }
}

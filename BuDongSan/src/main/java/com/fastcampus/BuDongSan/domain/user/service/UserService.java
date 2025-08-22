package com.fastcampus.BuDongSan.domain.user.service;

import com.fastcampus.BuDongSan.domain.user.dto.UserDto;
import com.fastcampus.BuDongSan.domain.user.entity.User;
import com.fastcampus.BuDongSan.domain.user.repository.UserRepository;
import com.fastcampus.BuDongSan.global.config.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    // 회원가입
    public User register(UserDto dto) {
        if (userRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        return userRepository.save(dto.toEntity(passwordEncoder));
    }

    // 로그인
    public String login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        // ✅ JWT 토큰에 username + nickname + role 포함
        return jwtTokenProvider.generateToken(user.getUsername(), user.getNickname(), user.getRole());
    }
}

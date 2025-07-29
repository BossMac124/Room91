package com.fastcampus.BuDongSan.dto;

import com.fastcampus.BuDongSan.entity.User;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.crypto.password.PasswordEncoder;

@Getter
@Setter
public class UserDto {
    private String username;    // 아이디
    private String password;    // 비밀번호
    private String nickname;    // 닉네임
    private String name;        // 이름
    private String gender;      // 성별
    private String email;       // 이메일
    private String role;        // ROLE_USER, ROLE_ADMIN

    // 👉 User 엔티티로 변환하는 메서드
    public User toEntity(PasswordEncoder passwordEncoder) {
        return User.builder()
                .username(username)
                .password(passwordEncoder.encode(this.password))  // 비밀번호는 암호화된 걸 받아서 넣음
                .nickname(nickname)
                .name(name)
                .gender(gender)
                .email(email)
                .role(this.role != null ? this.role : "ADMIN") // 기본값 설정
                .build();
    }
}

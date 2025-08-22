package com.fastcampus.BuDongSan.domain.user.entity;

import com.fastcampus.BuDongSan.global.common.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String username; // 아이디

    @Column(nullable = false)
    private String password; // 암호화된 비밀번호

    private String nickname;
    private String name;
    private String gender;
    private String email;
    private String role; // 예: ROLE_USER, ROLE_ADMIN
}

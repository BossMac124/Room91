package com.fastcampus.BuDongSan.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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

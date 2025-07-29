import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
    const navigate = useNavigate();
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        nickname: "",
        name: "",
        gender: "",
        email: "",
        role: "ROLE_USER", // 기본값
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${baseUrl}/api/users/register`, formData);
            alert("회원가입이 완료되었습니다.");
            navigate("/news");
        } catch (err) {
            console.error(err);
            alert("회원가입에 실패했습니다.");
        }
    };

    return (
        <div style={{ maxWidth: "500px", margin: "0 auto", padding: "1rem" }}>
            <h2>회원가입</h2>
            <form onSubmit={handleSubmit}>
                <input
                    name="username"
                    placeholder="아이디"
                    value={formData.username}
                    onChange={handleChange}
                    required
                /><br />
                <input
                    name="password"
                    type="password"
                    placeholder="비밀번호"
                    value={formData.password}
                    onChange={handleChange}
                    required
                /><br />
                <input
                    name="nickname"
                    placeholder="닉네임"
                    value={formData.nickname}
                    onChange={handleChange}
                    required
                /><br />
                <input
                    name="name"
                    placeholder="이름"
                    value={formData.name}
                    onChange={handleChange}
                    required
                /><br />
                <input
                    name="email"
                    type="email"
                    placeholder="이메일"
                    value={formData.email}
                    onChange={handleChange}
                    required
                /><br />
                <select name="gender" value={formData.gender} onChange={handleChange} required>
                    <option value="">성별 선택</option>
                    <option value="남">남</option>
                    <option value="여">여</option>
                </select><br />
                <button type="submit">회원가입</button>
            </form>
        </div>
    );
}

export default Register;

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {parseJwt} from "../utils/jwt.js";

function Login( { setUserRole} ) {
    const navigate = useNavigate();
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const goToRegister = () => {
        navigate("/register");
    };

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
            const response = await axios.post(`${baseUrl}/api/users/login`, formData);
            const token = response.data.token;

            if (!token) throw new Error("토큰 없음");

            // 토큰 저장
            localStorage.setItem("token", token);
            const parsed = parseJwt(token);
            setUserRole(parsed?.role); // ✅ App 상태 갱신

            alert("로그인 성공!");
            navigate("/news");
        } catch (err) {
            console.error("로그인 에러:", err);
            alert("로그인 실패: 아이디 또는 비밀번호를 확인해주세요.");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "0 auto", padding: "2rem" }}>
            <h2 style={{ textAlign: "center" }}>로그인</h2>
            <form onSubmit={handleSubmit}>
                <input
                    name="username"
                    placeholder="아이디"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem" }}
                />
                <input
                    name="password"
                    type="password"
                    placeholder="비밀번호"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem" }}
                />
                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: "0.6rem",
                        backgroundColor: "#333",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    로그인
                </button>
            </form>

            <hr style={{ margin: "2rem 0" }} />

            <button
                onClick={goToRegister}
                style={{
                    width: "100%",
                    padding: "0.6rem",
                    backgroundColor: "#888",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                }}
            >
                회원가입
            </button>
        </div>
    );
}

export default Login;

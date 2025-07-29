import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
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

            // 토큰 저장 (로컬스토리지 or 쿠키)
            localStorage.setItem("jwt", token);

            alert("로그인 성공!");
            navigate("/"); // 홈으로 이동 (필요하면 변경)
        } catch (err) {
            console.error(err);
            alert("로그인 실패: 아이디 또는 비밀번호를 확인해주세요.");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "0 auto", padding: "1rem" }}>
            <h2>로그인</h2>
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
                <button type="submit">로그인</button>
            </form>

            <hr />

            <button onClick={goToRegister}>회원가입</button>
        </div>
    );
}

export default Login;

import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token"); // 혹은 sessionStorage
        navigate("/"); // 로그아웃 후 로그인 페이지 이동
    };

    return <button onClick={handleLogout}>로그아웃</button>;
};

export default LogoutButton;

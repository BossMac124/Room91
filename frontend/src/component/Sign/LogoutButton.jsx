import { useNavigate } from "react-router-dom";

const LogoutButton = ({ setUserRole }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("jwt"); // 혹은 sessionStorage
        setUserRole(null); // 관리자 상태 초기화
        navigate("/"); // 로그아웃 후 로그인 페이지 이동
    };

    return <button onClick={handleLogout}>로그아웃</button>;
};

export default LogoutButton;

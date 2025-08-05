import { createContext, useContext, useState, useEffect } from "react";
import { parseJwt } from "../utils/jwt.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("jwt"));
    const [userRole, setUserRole] = useState(null);
    const [nickname, setNickname] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (token) {
            const parsed = parseJwt(token);
            setUserRole(parsed?.role || null);
            setNickname(parsed?.nickname || null);
        }
    }, [isLoggedIn]);

    return (
        <AuthContext.Provider value={{
            isLoggedIn,
            setIsLoggedIn,
            userRole,
            setUserRole,
            nickname,
            setNickname
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

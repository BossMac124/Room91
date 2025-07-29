import React, {useEffect, useRef, useState} from "react";
import NoticeEditor from "./NoticeEditor.jsx";
import {parseJwt} from "../utils/jwt.js";

// 개별 공지 항목을 보여주는 컴포넌트
function NoticeItem({ notice, getNotice, currentPage }) {
    const [open, setOpen] = useState(false);      // 공지 내용 펼치기 여부 상태
    const [editing, setEditing] = useState(false); // 수정 모드 여부 상태
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const token = localStorage.getItem("jwt");
    const userRole = token ? parseJwt(token)?.role : null;
    const isAdmin = userRole === "ROLE_ADMIN";

    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const safeSetEditing = (val) => {
        if (isMounted.current) setEditing(val);
    };

    const handleSave = async () => {
        await getNotice(currentPage);
        safeSetEditing(false);
    };

    // 공지 제목 클릭 시 펼치기/닫기 토글
    const toggleOpen = () => setOpen((prev) => !prev);

    // 공지 삭제 함수
    const deleteNotice = async () => {
        // 사용자에게 삭제 확인 받기
        if (!window.confirm("정말 삭제할까요?")) return;

        try {
            // DELETE 요청
            const res = await fetch(`${baseUrl}/api/notice/${notice.id}`, {
                method: "DELETE",
            });

            // 요청 실패 시 에러 발생
            if (!res.ok) throw new Error("삭제 실패");

            // 삭제 후 목록 새로고침
            await getNotice(currentPage);
        } catch (e) {
            alert("삭제에 실패했습니다.");
        }
    };

    return (
        <div style={{ marginBottom: "1rem", borderBottom: "1px solid #ddd", paddingBottom: "1rem", textAlign: "center" }}>
            {editing ? (
                <NoticeEditor
                    id={notice.id}
                    title={notice.title}
                    content={notice.content}
                    onCancel={() => safeSetEditing(false)}
                    onSave={handleSave}
                />
            ) : (
                <>
                    <div onClick={toggleOpen} style={{ cursor: "pointer", fontWeight: "bold" }}>
                        {notice.title}
                    </div>
                    {open && (
                        <div style={{ padding: "0.5rem 1rem", backgroundColor: "#f9f9f9" }}>
                            {notice.imageName && (
                                <img
                                    src={`${baseUrl}/uploads/${notice.imageName}`}
                                    alt="공지 이미지"
                                    style={{
                                        maxWidth: "50%",
                                        width: "100%",
                                        height: "auto",
                                        marginBottom: "1rem",
                                        borderRadius: "8px",
                                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                    }}
                                />
                            )}
                            <div className="notice-content" dangerouslySetInnerHTML={{ __html: notice.content }} />
                        </div>
                    )}
                    {isAdmin && (
                        <div style={{ marginTop: "0.5rem" }}>
                            <button onClick={() => setEditing(true)}>수정</button>
                            <button onClick={deleteNotice}>삭제</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default NoticeItem;

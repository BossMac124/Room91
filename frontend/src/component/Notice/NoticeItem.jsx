import React, { useState } from "react";
import NoticeEditor from "./NoticeEditor.jsx";

// 개별 공지 항목을 보여주는 컴포넌트
function NoticeItem({ notice, getNotice, currentPage }) {
    const [open, setOpen] = useState(false);      // 공지 내용 펼치기 여부 상태
    const [editing, setEditing] = useState(false); // 수정 모드 여부 상태

    // 공지 제목 클릭 시 펼치기/닫기 토글
    const toggleOpen = () => setOpen((prev) => !prev);

    // 공지 삭제 함수
    const deleteNotice = async () => {
        // 사용자에게 삭제 확인 받기
        if (!window.confirm("정말 삭제할까요?")) return;

        try {
            // DELETE 요청
            const res = await fetch(`/api/notice/${notice.id}`, {
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
        <div
            style={{
                marginBottom: "1rem",
                borderBottom: "1px solid #ddd",
                paddingBottom: "1rem",
                textAlign: "center",
            }}
        >
            {/* 수정 모드일 때는 NoticeEditor 렌더링 */}
            {editing ? (
                <NoticeEditor
                    id={notice.id}               // 수정할 공지 ID
                    title={notice.title}         // 기존 제목
                    content={notice.content}     // 기존 내용
                    onCancel={() => setEditing(false)} // 취소 버튼 클릭 시 수정 모드 종료
                    onSave={() => {
                        getNotice(currentPage);  // 저장 후 공지 리스트 갱신
                        setEditing(false);       // 수정 모드 종료
                    }}
                />
            ) : (
                <>
                    {/* 제목 표시 (클릭 시 내용 열기/닫기) */}
                    <div
                        onClick={toggleOpen}
                        style={{ cursor: "pointer", fontWeight: "bold" }}
                    >
                        {notice.title}
                    </div>

                    {/* 내용 표시 (open이 true일 때만 보임) */}
                    {open && (
                        <div
                            style={{
                                padding: "0.5rem 1rem",
                                backgroundColor: "#f9f9f9",
                            }}
                        >
                            {/* 이미지가 있을 경우 먼저 출력 */}
                            {notice.imageName && (
                                <img
                                    src={`/uploads/${notice.imageName}`}
                                    alt="공지 이미지"
                                    style={{
                                        maxWidth: "50%",
                                        Width: "100%",
                                        height: "auto",
                                        marginBottom: "1rem",
                                        borderRadius: "8px",
                                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                    }}
                                />
                            )}

                            {/* 공지 내용은 HTML로 렌더링 */}
                            <div
                                className="notice-content"
                                dangerouslySetInnerHTML={{ __html: notice.content }} />
                        </div>
                    )}

                    {/* 수정/삭제 버튼 */}
                    <div style={{ marginTop: "0.5rem" }}>
                        <button onClick={() => setEditing(true)}>수정</button>
                        <button onClick={deleteNotice}>삭제</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default NoticeItem;

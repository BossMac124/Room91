import React, { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";        // CKEditor 리액트 컴포넌트
import ClassicEditor from "@ckeditor/ckeditor5-build-classic"; // CKEditor의 클래식 에디터 빌드

// 공지사항 수정용 에디터 컴포넌트
function NoticeEditor({ id, title, content, onCancel, onSave }) {
    // 제목과 내용 상태 저장 (수정 가능한 입력값)
    const [editedTitle, setEditedTitle] = useState(title);
    const [editedContent, setEditedContent] = useState(content);

    // 저장 버튼 클릭 시 호출되는 함수
    const save = async () => {
        try {
            // PUT 요청으로 서버에 수정 데이터 전송
            const res = await fetch(`http://localhost:8080/api/notice/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: editedTitle,
                    content: editedContent,
                }),
            });

            // 실패 시 에러 처리
            if (!res.ok) throw new Error("수정 실패");

            // 저장 성공 시 부모 컴포넌트로부터 전달된 onSave 콜백 실행
            onSave();
        } catch (e) {
            alert("수정에 실패했습니다.");
        }
    };

    return (
        <>
            {/* 제목 입력창 */}
            <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)} // 입력값 상태 업데이트
                style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    width: "100%",
                }}
            />

            {/* CKEditor 본문 입력 영역 */}
            <CKEditor
                editor={ClassicEditor}           // 클래식 에디터 사용
                data={editedContent}             // 초기값 세팅
                onChange={(event, editor) => setEditedContent(editor.getData())} // 변경 시 상태 업데이트
            />

            {/* 저장 버튼 */}
            <button
                onClick={save}
                style={{ marginTop: "0.5rem", marginRight: "0.5rem" }}
            >
                저장
            </button>

            {/* 취소 버튼 */}
            <button onClick={onCancel}>취소</button>
        </>
    );
}

export default NoticeEditor;

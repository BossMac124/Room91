import React, { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { MyCustomUploadAdapterPlugin } from "../utils/MyUploadAdapter.jsx";

function NoticeEditor({ id, title, content, onCancel, onSave }) {
    // 제목과 내용을 상태로 관리 (입력값 추적용)
    const [editedTitle, setEditedTitle] = useState(title);
    const [editedContent, setEditedContent] = useState(content);
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    // 저장 버튼 클릭 시 서버에 PUT 요청 보내기
    const save = async () => {
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${baseUrl}/api/notice/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: editedTitle,
                    content: editedContent,
                }),
            });

            if (!res.ok) throw new Error("수정 실패");
            onSave();
        } catch (e) {
            alert("수정에 실패했습니다.");
        }
    };

    return (
        <>
            {/* 제목 입력란 */}
            <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    width: "100%",
                }}
            />

            {/* CKEditor 본문 입력 영역 */}
            <div>
                <CKEditor
                    editor={ClassicEditor}
                    data={editedContent}
                    config={{
                        extraPlugins: [MyCustomUploadAdapterPlugin("/api/notice/upload/image")],    // 이미지 업로드 플러그인 설정
                        toolbar: [
                            "heading", "|",
                            "bold", "italic", "link", "bulletedList", "numberedList", "|",
                            "insertTable", "imageUpload", "mediaEmbed", "undo", "redo"
                        ],
                        image: {
                            toolbar: [
                                "imageTextAlternative"  // // 이미지 대체 텍스트 툴바
                            ]
                        },
                        mediaEmbed: {
                            previewsInData: true    // 미디어 미리보기를 HTML 데이터에 포함
                        },
                    }}
                    onChange={(event, editor) =>
                        setEditedContent(editor.getData()) // 본문 내용 실시간 반영
                    }
                />
            </div>

            <button
                onClick={save}
                style={{ marginTop: "0.5rem", marginRight: "0.5rem" }}
            >
                저장
            </button>
            <button onClick={onCancel}>취소</button>
        </>
    );
}

export default NoticeEditor;

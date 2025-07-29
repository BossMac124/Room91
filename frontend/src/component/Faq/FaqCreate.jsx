import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/button.css";
import "../../css/ckeditor.css"; // 전역 스타일
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import {MyCustomUploadAdapterPlugin} from "../utils/MyUploadAdapter.jsx";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

// ✅ 이미지 업로더 클래스
class MyUploadAdapter {
    constructor(loader, uploadUrl) {
        this.loader = loader;
        this.uploadUrl = uploadUrl;
    }

    upload() {
        const token = localStorage.getItem("jwt");

        return this.loader.file.then((file) => {
            const data = new FormData();
            data.append("upload", file);

            return fetch(`${baseUrl}${this.uploadUrl}`, {
                method: "POST",
                body: data,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(async (res) => {
                    if (!res.ok) {
                        const text = await res.text();
                        throw new Error(`이미지 업로드 실패: ${res.status} ${text}`);
                    }
                    return res.json();
                })
                .then((res) => {
                    if (res && res.url) {
                        return { default: res.url };
                    }
                    throw new Error("이미지 업로드 실패: URL 없음");
                });
        });
    }

    abort() {
        // 취소 시 구현 가능
    }
}

// ✅ Faq 작성 컴포넌트
function FaqCreate() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const navigate = useNavigate();
    const token = localStorage.getItem("jwt");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${baseUrl}/api/faq`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ question, answer }),
            });
            if (!res.ok) throw new Error("등록 실패");
            navigate("/faq");
        } catch (err) {
            alert("등록 실패");
            console.error(err);
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>FAQ 작성</h2>

            <form onSubmit={handleSubmit}>
                {/* 질문 */}
                <div style={{ marginBottom: "1rem" }}>
                    <label>질문</label>
                    <br />
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        style={{ width: "100%" }}
                        required
                    />
                </div>

                {/* 답변 (CKEditor) */}
                <div style={{ marginBottom: "1rem" }}>
                    <label>답변</label>
                    <br />
                    <CKEditor
                        editor={ClassicEditor}
                        data={answer}
                        config={{
                            extraPlugins: [MyCustomUploadAdapterPlugin("/api/faq/upload/image")],
                            toolbar: [
                                "heading",
                                "|",
                                "bold",
                                "italic",
                                "link",
                                "bulletedList",
                                "numberedList",
                                "|",
                                "insertTable",
                                "imageUpload",
                                "mediaEmbed",
                                "undo",
                                "redo",
                            ],
                            image: {
                                toolbar: ["imageTextAlternative"],
                            },
                            mediaEmbed: {
                                previewsInData: true,
                            },
                        }}
                        onChange={(event, editor) => setAnswer(editor.getData())}
                    />
                </div>

                {/* 버튼 */}
                <div
                    style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}
                >
                    <button
                        type="button"
                        className="btn btn-cancel"
                        onClick={() => navigate("/faq")}
                    >
                        취소
                    </button>
                    <button type="submit" className="btn btn-submit">
                        등록
                    </button>
                </div>
            </form>
        </div>
    );
}

export default FaqCreate;

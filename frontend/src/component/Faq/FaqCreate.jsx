import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/button.css";
import "../../css/ckeditor.css";    // 전역 스타일 추가
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const baseUrl = import.meta.env.VITE_API_BASE_URL;
class CustomUploadAdapter {
    constructor(loader) {
        this.loader = loader;
    }

    upload() {
        return this.loader.file.then(file => {
            const data = new FormData();
            data.append("upload", file);

            return fetch(`${baseUrl}/api/uploads`, {
                method: "POST",
                body: data,
            })
                .then(res => res.json())
                .then(json => ({ default: json.default }));
        });
    }

    abort() {
        // 필요 시 구현
    }
}

function FaqCreate() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await fetch(`${baseUrl}/api/faq`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question, answer }),
            });
            if (!res.ok) throw new Error("등록 실패");
            navigate("/faq");
        } catch {
            alert("등록 실패");
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>FAQ 작성</h2>

            <form onSubmit={handleSubmit}>
                {/* 질문 입력 */}
                <div style={{ marginBottom: "1rem" }}>
                    <label>질문</label><br />
                    <input
                        type="text"
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        style={{ width: "100%" }}
                        required
                    />
                </div>

                {/* 답변 입력 (CKEditor) */}
                <div style={{ marginBottom: "1rem" }}>
                    <label>답변</label><br />

                    <CKEditor
                        editor={ClassicEditor}
                        data={answer}
                        onChange={(e, editor) => setAnswer(editor.getData())}
                        config={{
                            toolbar: [
                                "heading","|","bold","italic","link",
                                "bulletedList","numberedList","blockQuote","|",
                                "undo","redo","imageUpload"
                            ],
                            simpleUpload: {
                                uploadUrl: `${baseUrl}/api/uploads/images`,
                            },
                            placeholder: "답변을 입력하세요...",
                            contentStyle: "body { color: #000; }"
                        }}
                    />
                </div>

                {/* 버튼 */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                    <button type="button" className="btn btn-cancel" onClick={() => navigate("/faq")}>
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

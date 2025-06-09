import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/button.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";


function FaqCreate() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:8080/api/faq", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question, answer }),
            });
            if (!res.ok) throw new Error("등록 실패");
            navigate("/faq");
        } catch (err) {
            alert("등록 실패");
        }
    };

    // 취소 버튼 클릭 시 FAQ 목록으로 돌아가기
    const handleCancel = () => {
        navigate("/faq");
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>FAQ 작성</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "1rem" }}>
                    <label>질문</label><br />
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        style={{ width: "100%" }}
                        required
                    />
                </div>
                {/* 답변 입력 (CKEditor) */}
                <div style={{ marginBottom: "1rem" }}>
                    <label>답변</label><br />
                    {/* 에디터 컨테이너: 가로폭 100% */}
                    <div
                        style={{
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            width: "100%",
                            overflow: "hidden",
                        }}
                    >
                        <CKEditor
                            editor={ClassicEditor}
                            data={answer} // 초기값 또는 편집 중 HTML 문자열
                            onChange={(event, editor) => {
                                const data = editor.getData();
                                setAnswer(data);
                            }}
                            config={{
                                toolbar: [
                                    "heading", "|",
                                    "bold", "italic", "link",
                                    "bulletedList", "numberedList", "blockQuote", "|",
                                    "undo", "redo",
                                ],
                                placeholder: "답변을 입력하세요...",
                            }}
                        />
                    </div>
                </div>

                {/* 버튼 컨테이너: 오른쪽 정렬 */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                    {/* 취소 버튼 */}
                    <button
                        type="button"
                        className="btn btn-cancel"
                        onClick={handleCancel}>취소
                    </button>

                    {/* 등록 버튼 */}
                    <button
                        type="submit"
                        className="btn btn-submit">등록
                    </button>
                </div>

            </form>
        </div>
    );
}

export default FaqCreate;
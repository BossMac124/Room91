import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
                <div style={{ marginBottom: "1rem" }}>
                    <label>답변</label><br />
                    <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        rows="4"
                        style={{ width: "100%" }}
                        required
                    />
                </div>
                <button type="submit">등록</button>
            </form>
        </div>
    );
}

export default FaqCreate;
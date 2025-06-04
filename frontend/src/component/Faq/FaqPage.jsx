import React, { useEffect, useState } from "react";

function FaqPage() {
    const [faqs, setFaqs] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8080/api/faq")
            .then(res => res.json())
            .then(data => setFaqs(data))
            .catch(err => console.error("FAQ 불러오기 실패", err));
    }, []);

    return (
        <div style={{ padding: "2rem" }}>
            <h2>자주 묻는 질문 (FAQ)</h2>
            {faqs.length === 0 ? (
                <p>FAQ가 없습니다.</p>
            ) : (
                faqs.map((faq) => (
                    <div key={faq.id} style={{ marginBottom: "1rem" }}>
                        <strong>Q. {faq.question}</strong>
                        <p>A. {faq.answer}</p>
                    </div>
                ))
            )}
        </div>
    );
}

export default FaqPage;

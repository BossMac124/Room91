import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import "../../css/FaqPage.css";
import {parseJwt} from "../utils/jwt.js";

export default function FaqPage() {
    const [faqs, setFaqs] = useState([]);
    const [openSet, setOpenSet] = useState(new Set());
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const token = localStorage.getItem("jwt");
    const userRole = token ? parseJwt(token)?.role : null;
    const isAdmin = userRole     === "ROLE_ADMIN";

    useEffect(() => {
        fetch(`${baseUrl}/api/faq?page=0&size=10`)
            .then(res => res.json())
            .then(json => setFaqs(json.content))
            .catch(() => setFaqs([]));
    }, []);

    const toggleAnswer = idx => {
        setOpenSet(prev => {
            const next = new Set(prev);
            next.has(idx) ? next.delete(idx) : next.add(idx);
            return next;
        });
    };

    const deleteFaq = async id => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        await fetch(`${baseUrl}/api/faq/${id}`, { method: 'DELETE' });
        setFaqs(faqs.filter(f => f.id !== id));
    };

    return (
        <div className="faq-container">
            <h2>자주 묻는 질문 (FAQ)</h2>
            {isAdmin && (
                <Link to="/faq/create">
                    <button className="faq-create-btn">FAQ 작성</button>
                </Link>
            )}

            {faqs.length === 0 && <p>등록된 FAQ가 없습니다.</p>}

            {faqs.map((faq, idx) => {
                const isOpen = openSet.has(idx);
                const hasImg = /<img\s/i.test(faq.answer);

                return (
                    <div key={faq.id} className="faq-item">
                        {/* 질문 행 */}
                        <div className="faq-row">
                            <span className="faq-label">Q.</span>
                            <span
                                className="faq-question"
                                onClick={() => toggleAnswer(idx)}
                            >
                {faq.question}
                                {hasImg && <span className="faq-clip">📎</span>}
              </span>
                        </div>

                        {/* 답변 행 (열려 있을 때만) */}
                        {isOpen && (
                            <div className="faq-row">
                                <span className="faq-label">A.</span>
                                <div
                                    className="faq-answer"
                                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                                />
                            </div>
                        )}

                        {/* 삭제 행 */}
                        {isAdmin && (
                            <div className="faq-row faq-delete-row">
                                <button
                                    className="faq-delete-btn"
                                    onClick={() => deleteFaq(faq.id)}
                                >
                                    삭제
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

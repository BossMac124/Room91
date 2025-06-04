import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function FaqPage() {
    const [faqs, setFaqs] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [openIndex, setOpenIndex] = useState(null);

    const fetchFaqs = async (pageNum = 0) => {
        try {
            const res = await fetch(`http://localhost:8080/api/faq?page=${pageNum}&size=5`);
            const data = await res.json();
            setFaqs(data.content);
            setPage(data.number);
            setTotalPages(data.totalPages);
        } catch (e) {
            console.error('FAQ 목록 불러오기 실패', e);
            setFaqs([]);
        }
    };

    const deleteFaq = async (id) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await fetch(`http://localhost:8080/api/faq/${id}`, { method: 'DELETE' });
            fetchFaqs(page);
        } catch (e) {
            alert('삭제 실패');
        }
    };

    useEffect(() => {
        fetchFaqs(0);
    }, []);

    const toggleAnswer = (index) => {
        setOpenIndex(prev => (prev === index ? null : index));
    };

    console.log("faqs:", faqs);

    return (
        <div style={{ padding: '2rem' }}>
            <h2>자주 묻는 질문 (FAQ)</h2>
            <Link to="/faq/create">
                <button style={{ marginBottom: '1rem' }}>FAQ 작성</button>
            </Link>

            {faqs && faqs.length === 0 ? (
                <p>FAQ가 없습니다.</p>
            ) : (
                faqs.map((faq, idx) => (
                    <div key={faq.id} style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
                        <div
                            onClick={() => toggleAnswer(idx)}
                            style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}
                        >
                            Q. {faq.question}
                        </div>
                        {openIndex === idx && (
                            <div style={{ marginBottom: '0.5rem' }}>
                                A. {faq.answer}
                            </div>
                        )}
                        <button onClick={() => deleteFaq(faq.id)} style={{ marginRight: '0.5rem' }}>삭제</button>
                    </div>
                ))
            )}

            {/* 숫자 페이지네이션 */}
            <div style={{ marginTop: '2rem' }}>
                {/* ◀ 이전 그룹 */}
                {page >= 10 && (
                    <button onClick={() => fetchFaqs(Math.floor((page - 10) / 10) * 10)}>
                        ◀
                    </button>
                )}

                {Array.from({ length: Math.min(10, totalPages - Math.floor(page / 10) * 10) }, (_, i) => {
                    const pageNumber = Math.floor(page / 10) * 10 + i;
                    return (
                        <button
                            key={pageNumber}
                            onClick={() => fetchFaqs(pageNumber)}
                            style={{
                                margin: '0 4px',
                                fontWeight: pageNumber === page ? 'bold' : 'normal',
                                backgroundColor: pageNumber === page ? '#FF6B3D' : 'white',
                                color: pageNumber === page ? 'white' : 'black',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                padding: '4px 8px',
                            }}
                        >
                            {pageNumber + 1}
                        </button>
                    );
                })}

                {/* ▶ 다음 그룹 */}
                {(Math.floor(page / 10) + 1) * 10 < totalPages && (
                    <button onClick={() => fetchFaqs((Math.floor(page / 10) + 1) * 10)}>
                        ▶
                    </button>
                )}
            </div>
        </div>
    );
}

export default FaqPage;
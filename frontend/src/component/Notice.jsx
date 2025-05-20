import { useEffect, useState } from "react";

function Notice() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageInfo, setPageInfo] = useState({
        number: 0,
        totalPages: 0,
        first: true,
        last: false
    });
    const [openIndex, setOpenIndex] = useState(null); // 열려 있는 인덱스 상태

    const getNotice = async (page = 0) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/api/notice?page=${page}`);
            const json = await res.json();
            setNotices(json.content);
            setPageInfo({
                number: json.number,
                totalPages: json.totalPages,
                first: json.first,
                last: json.last
            });
        } catch (e) {
            console.error("공지 불러오기 실패", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getNotice(0);
    }, []);

    const toggleContent = (index) => {
        setOpenIndex(prevIndex => (prevIndex === index ? null : index));
    };

    return (
        <div>
            {loading ? (
                <p>로딩중...</p>
            ) : (
                <>
                    {notices.map((notice, index) => (
                        <div key={notice.id} className="notice" style={{ marginBottom: '1rem' }}>
                            <div
                                onClick={() => toggleContent(index)}
                                style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem' }}
                            >
                                {notice.title}
                            </div>
                            {openIndex === index && (
                                <div style={{ padding: '0.5rem 1rem', backgroundColor: '#f9f9f9' }}>
                                    {notice.content}
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="pagination">
                        <button
                            onClick={() => getNotice(pageInfo.number - 1)}
                            disabled={pageInfo.first}
                        >
                            이전
                        </button>
                        <span>
                            {pageInfo.number + 1} / {pageInfo.totalPages}
                        </span>
                        <button
                            onClick={() => getNotice(pageInfo.number + 1)}
                            disabled={pageInfo.last}
                        >
                            다음
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Notice;

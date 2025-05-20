import { useEffect, useState } from "react";

function Notice() {
    const [notices, setNotices] = useState([]);     // 공지사항 목록을 담는 배열
    const [loading, setLoading] = useState(true); // 데이터를 불러오는 중인지 여부 확인(로딩중)
    const [pageInfo, setPageInfo] = useState({       // 페이지 관련 정보 저장
        number: 0,          // 현재 페이지
        totalPages: 0,      // 전체 페이지
        first: true,        // 첫 페이지
        last: false         // 마지막 페이지
    });
    const [openIndex, setOpenIndex] = useState(null); // 열려 있는 인덱스 상태

    // 공지사항 가져오기
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

    // 초기 렌더링 시 공지사항 첫 페이지 불러오기
    useEffect(() => {
        getNotice(0);
    }, []);

    // 공지 사항 토글 함수
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

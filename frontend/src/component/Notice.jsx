import { useEffect, useState } from "react";

function Notice() {
    const [notices, setNotices] = useState([]); // 공지사항 목록
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [pageInfo, setPageInfo] = useState({
        number: 0,
        totalPages: 0,
        first: true,
        last: false
    });
    const [openIndex, setOpenIndex] = useState(null); // 열려있는 공지 index
    const [searchKeyword, setSearchKeyword] = useState(""); // 검색어
    const [searchType, setSearchType] = useState("title"); // 검색 타입
    const [isSearching, setIsSearching] = useState(false); // 검색 중 여부

    // 공지사항 불러오기
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

    // 검색 실행
    const handleSearch = async (page = 0) => {
        setLoading(true);
        setIsSearching(true);
        try {
            const res = await fetch(`http://localhost:8080/api/notice/search?keyword=${searchKeyword}&type=${searchType}&page=${page}`);
            const json = await res.json();
            setNotices(json.content);
            setPageInfo({
                number: json.number,
                totalPages: json.totalPages,
                first: json.first,
                last: json.last
            });
        } catch (e) {
            console.error("검색 실패", e);
        } finally {
            setLoading(false);
        }
    };

    // 검색어 없을 경우 전체 조회로 복귀
    useEffect(() => {
        if (searchKeyword.trim() === "") {
            setIsSearching(false);
            getNotice(0);
        }
    }, [searchKeyword]);

    // 첫 렌더링 시 공지 불러오기
    useEffect(() => {
        getNotice(0);
    }, []);

    // 공지 토글
    const toggleContent = (index) => {
        setOpenIndex(prevIndex => (prevIndex === index ? null : index));
    };

    return (
        <div>
            {loading ? (
                <p>로딩중...</p>
            ) : (
                <>
                    {/* 🔍 검색 UI */}
                    <div style={{ marginBottom: '1rem' }}>
                        <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            placeholder="검색어 입력"
                            style={{ marginRight: '0.5rem' }}
                        />
                        <select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                            style={{ marginRight: '0.5rem' }}
                        >
                            <option value="title">제목</option>
                            <option value="content">내용</option>
                            <option value="title_content">제목+내용</option>
                        </select>
                        <button onClick={() => handleSearch(0)}>검색</button>
                    </div>

                    {/* 📋 공지 목록 */}
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

                    {/* 📄 페이지네이션 */}
                    <div className="pagination">
                        <button
                            onClick={() =>
                                isSearching
                                    ? handleSearch(pageInfo.number - 1)
                                    : getNotice(pageInfo.number - 1)
                            }
                            disabled={pageInfo.first}
                        >
                            이전
                        </button>
                        <span>
                            {pageInfo.number + 1} / {pageInfo.totalPages}
                        </span>
                        <button
                            onClick={() =>
                                isSearching
                                    ? handleSearch(pageInfo.number + 1)
                                    : getNotice(pageInfo.number + 1)
                            }
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

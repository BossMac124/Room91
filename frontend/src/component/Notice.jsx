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

    return (
        <div>
            {loading ? (
                <p>로딩중...</p>
            ) : (
                <>
                    {notices.map((notice) => (
                        <div key={notice.id} className="notice">
                            <p>{notice.id}</p>
                            <p>{notice.title}</p>
                            <p>{notice.content}</p>
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

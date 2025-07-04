import React, { useEffect, useState, useRef } from "react";
import NoticeSearch from "./NoticeSearch.jsx";
import NoticeList from "./NoticeList.jsx";

function NoticePage() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageInfo, setPageInfo] = useState({
        number: 0,
        totalPages: 0,
        first: true,
        last: false,
    });

    const isMounted = useRef(true);
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    console.log(baseUrl);

    const getNotice = async (page = 0) => {
        setLoading(true);
        try {
            const res = await fetch(`${baseUrl}/api/notice?page=${page}`);
            const json = await res.json();

            if (isMounted.current) { // 컴포넌트가 살아있으면 상태 업데이트
                setNotices(json.content);
                setPageInfo({
                    number: json.number,
                    totalPages: json.totalPages,
                    first: json.first,
                    last: json.last,
                });
                setLoading(false);
            }
        } catch (e) {
            console.error("공지 불러오기 실패", e);
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        getNotice(0);

        return () => {
            isMounted.current = false;  // 언마운트 시점에 false로 변경
        };
    }, []);

    return (

        <div style={{
            maxWidth: '1200px',  // 최대 너비 제한
            margin: '0 auto',    // 좌우 마진 자동 → 가운데 정렬
            padding: '20px',     // 안쪽 여백
        }}>
            <NoticeSearch onSearch={setNotices} setPageInfo={setPageInfo} />
            {loading ? (
                <p>로딩중...</p>
            ) : (
                <NoticeList
                    notices={notices}
                    pageInfo={pageInfo}
                    getNotice={getNotice}
                />
            )}
        </div>
    );
}

export default NoticePage;

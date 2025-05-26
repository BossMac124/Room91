import React, { useEffect, useState } from "react";
import NoticeSearch from "./NoticeSearch.jsx"; // 검색 컴포넌트
import NoticeList from "./NoticeList.jsx";     // 리스트 출력 컴포넌트

// 공지사항 전체 페이지 컴포넌트
function NoticePage() {
    // 공지 목록 상태
    const [notices, setNotices] = useState([]);

    // 로딩 여부 상태
    const [loading, setLoading] = useState(true);

    // 페이지 정보 상태 (페이지네이션용)
    const [pageInfo, setPageInfo] = useState({
        number: 0,        // 현재 페이지 번호
        totalPages: 0,    // 전체 페이지 수
        first: true,      // 첫 페이지 여부
        last: false,      // 마지막 페이지 여부
    });

    // 서버에서 공지 목록을 가져오는 함수
    const getNotice = async (page = 0) => {
        setLoading(true); // 로딩 시작
        try {
            // 공지 API 호출
            const res = await fetch(`http://localhost:8080/api/notice?page=${page}`);
            const json = await res.json();

            // 응답 데이터로 상태 업데이트
            setNotices(json.content);
            setPageInfo({
                number: json.number,
                totalPages: json.totalPages,
                first: json.first,
                last: json.last,
            });
        } catch (e) {
            console.error("공지 불러오기 실패", e);
        } finally {
            setLoading(false); // 로딩 종료
        }
    };

    // 페이지가 처음 렌더링될 때 공지사항 1페이지 가져오기
    useEffect(() => {
        getNotice(0);
    }, []);

    return (
        <div>
            {/* 검색 컴포넌트 */}
            <NoticeSearch onSearch={setNotices} setPageInfo={setPageInfo} />

            {/* 로딩 중이면 로딩 표시, 아니면 공지 리스트 보여주기 */}
            {loading ? (
                <p>로딩중...</p>
            ) : (
                <NoticeList
                    notices={notices}       // 공지 목록
                    pageInfo={pageInfo}     // 페이지 정보
                    getNotice={getNotice}   // 페이지 변경 시 다시 불러오는 함수
                />
            )}
        </div>
    );
}

export default NoticePage;

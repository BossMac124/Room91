import React, { useState } from "react";

// 공지사항 검색 컴포넌트
function NoticeSearch({ onSearch, setPageInfo }) {
    // 검색어 상태
    const [searchKeyword, setSearchKeyword] = useState("");

    // 검색 유형 상태 (title, content, title_content)
    const [searchType, setSearchType] = useState("title");

    // 검색 실행 함수
    const handleSearch = async () => {
        try {
            // 검색 API 호출 (page는 항상 0부터 시작)
            const res = await fetch(
                `http://3.39.127.143/api/notice/search?keyword=${searchKeyword}&type=${searchType}&page=0`
            );
            const json = await res.json();

            // 검색 결과 리스트를 부모로 전달
            onSearch(json.content);

            // 페이징 정보도 부모로 전달
            setPageInfo({
                number: json.number,         // 현재 페이지 번호
                totalPages: json.totalPages, // 전체 페이지 수
                first: json.first,           // 첫 페이지 여부
                last: json.last,             // 마지막 페이지 여부
            });
        } catch (e) {
            console.error("검색 실패", e);
        }
    };

    // 엔터 키 입력 시 검색 실행
    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSearch();
    };

    return (
        <div style={{ marginTop: "1rem", textAlign: "center" }}>
            {/* 검색어 입력 */}
            <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)} // 입력 상태 업데이트
                onKeyDown={handleKeyDown}                          // 엔터 입력 시 검색 실행
                placeholder="검색어 입력"
            />

            {/* 검색 조건 선택 */}
            <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                <option value="title">제목</option>
                <option value="content">내용</option>
                <option value="title_content">제목+내용</option>
            </select>

            {/* 검색 버튼 */}
            <button onClick={handleSearch}>검색</button>
        </div>
    );
}

export default NoticeSearch;

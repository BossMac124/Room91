import React from "react";
import NoticeItem from "./NoticeItem";
import { Link } from "react-router-dom";

// NoticeList 컴포넌트는 공지 리스트 + 페이징 + 공지 작성 버튼을 렌더링함
function NoticeList({ notices, pageInfo, getNotice }) {
    return (
        <div>
            {/* 공지 작성 페이지로 이동하는 버튼 */}
            <div style={{ marginBottom: "1rem" }}>
                <Link to="/notice/create">
                    <button>공지사항 작성</button>
                </Link>
            </div>

            {/* 공지 리스트 렌더링 - 하나하나 NoticeItem 컴포넌트로 전달 */}
            {notices.map((notice, index) => (
                <NoticeItem
                    key={notice.id}               // React가 리스트 아이템을 구분할 때 사용
                    notice={notice}               // 공지 객체 자체
                    index={index}                 // 공지 순번 (0부터 시작)
                    getNotice={getNotice}         // 수정/삭제 후 리스트 갱신을 위한 콜백 함수
                    currentPage={pageInfo.number} // 현재 페이지 번호 전달
                />
            ))}

            {/* 페이지네이션 영역 */}
            <div className="pagination" style={{ marginTop: "1rem" }}>
                {/* 이전 버튼 - 첫 페이지일 경우 비활성화 */}
                <button
                    onClick={() => getNotice(pageInfo.number - 1)} // 이전 페이지 요청
                    disabled={pageInfo.first}                      // 첫 페이지면 비활성화
                >
                    이전
                </button>

                {/* 현재 페이지 정보 표시 (0부터 시작이라 +1 처리) */}
                <span>
                    {pageInfo.number + 1} / {pageInfo.totalPages}
                </span>

                {/* 다음 버튼 - 마지막 페이지일 경우 비활성화 */}
                <button
                    onClick={() => getNotice(pageInfo.number + 1)} // 다음 페이지 요청
                    disabled={pageInfo.last}                       // 마지막 페이지면 비활성화
                >
                    다음
                </button>
            </div>
        </div>
    );
}

export default NoticeList;

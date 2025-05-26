import React from 'react';

// HTML 태그를 제거하고 텍스트만 추출하는 함수
function stripHtml(html) {
    // HTML 문자열을 DOM 객체로 파싱
    const doc = new DOMParser().parseFromString(html, 'text/html');
    // body 안의 텍스트 내용만 반환 (HTML 태그 제거)
    return doc.body.textContent || "";
}

// 공지 내용에서 HTML 태그를 제거한 순수 텍스트를 렌더링하는 컴포넌트
function NoticeContentView({ content }) {
    return (
        <div>
            {stripHtml(content)} {/* HTML 제거된 텍스트 표시 */}
        </div>
    );
}

export default NoticeContentView;

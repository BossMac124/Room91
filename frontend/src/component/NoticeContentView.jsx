import React from 'react';

function stripHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

function NoticeContentView({ content }) {
    return (
        <div>
            {stripHtml(content)}
        </div>
    );
}

export default NoticeContentView;

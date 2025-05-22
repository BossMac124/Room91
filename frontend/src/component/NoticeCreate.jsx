import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function NoticeCreate() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/notice', { title, content });
            alert('공지사항이 등록되었습니다.');
            navigate('/notice'); // 공지 목록 페이지로 이동
        } catch (err) {
            console.error(err);
            alert('등록에 실패했습니다.');
        }
    };

    return (
        <div className="notice-create-container">
            <h2>공지사항 등록</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>제목</label><br />
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>내용</label><br />
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={8}
                        required
                    />
                </div>
                <button type="submit">등록</button>
            </form>
        </div>
    );
}

export default NoticeCreate;
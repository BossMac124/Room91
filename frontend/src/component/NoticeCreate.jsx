import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// CKEditor import
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

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
                    <CKEditor
                        editor={ClassicEditor}
                        data={content}
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            setContent(data);
                        }}
                    />
                </div>
                <button type="submit">등록</button>
            </form>
        </div>
    );
}

export default NoticeCreate;

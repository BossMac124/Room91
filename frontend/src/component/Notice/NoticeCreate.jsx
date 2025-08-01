import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { MyCustomUploadAdapterPlugin } from "../utils/MyUploadAdapter.jsx";

// 제목과 내용 상태를 useState로 관리
function NoticeCreate() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const navigate = useNavigate();                 // 페이지 이동을 위한 훅
    const editorRef = useRef(null);       // 에디터 인스턴스 저장용 ref
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("jwt");

    // 공지사항 등록 버튼 클릭 시 실행될 함수
    const handleSubmit = async (e) => {
        e.preventDefault(); // 폼 제출 기본 동작 방지
        try {
            // 제목과 내용을 서버에 POST 요청
            await axios.post(`${baseUrl}/api/notice`, { title, content }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            alert('공지사항이 등록되었습니다.');
            navigate('/notice');
        } catch (err) {
            console.error(err);
            alert('등록에 실패했습니다.');
        }
    };

    return (
        <div className="notice-create-container"
             style={{ marginTop: "1rem", textAlign: "center" }}>
            <h2>공지사항 등록</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>제목</label><br />
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        style={{ display: 'block', margin: '0 auto', width: '50%' }}
                    />
                </div>
                <div
                    style={{ display: 'block', margin: '0 auto', width: '50%' }}>
                    <label>내용</label><br />
                    <CKEditor
                        editor={ClassicEditor}
                        data={content}
                        config={{
                            extraPlugins: [MyCustomUploadAdapterPlugin("/api/notice/upload/image")], // 이미지 업로드 플러그인 추가
                        }}
                        onReady={(editor) => {
                            editorRef.current = editor;     // 에디터 인스턴스 저장
                        }}
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

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import MyCustomUploadAdapterPlugin from './MyUploadAdapterFaq.jsx';


function FaqCreate() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const navigate = useNavigate();
    const editorRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/faq', {
                question: question,
                answer: answer,
                category: 'default' // 필요시 값 지정
            });
            alert('FAQ가 등록되었습니다.');
            navigate('/faq');   // FAQ 목록 페이지로 이동
        } catch (err) {
            console.error(err);
            alert('등록에 실패했습니다.');
        }
    };

    useEffect(() => {
        return () => {
            if (editorRef.current) {
                editorRef.current.destroy().catch(err => {
                    console.error('Editor destroy error:', err);
                });
            }
        };
    }, []);

    return (
        <div className="faq-create-container" style={{ marginTop: "1rem", textAlign: "center" }}>
            <h2>FAQ 등록</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>질문</label><br />
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        required
                        style={{ display: 'block', margin: '0 auto', width: '50%' }}
                    />
                </div>
                <div style={{ display: 'block', margin: '1rem auto', width: '50%' }}>
                    <label>답변</label><br />
                    <CKEditor
                        editor={ClassicEditor}
                        data={answer}
                        config={{
                            extraPlugins: [MyCustomUploadAdapterPlugin]
                        }}
                        onReady={(editor) => {
                            editorRef.current = editor;
                        }}
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            setAnswer(data);
                        }}
                    />
                </div>
                <button type="submit">등록</button>
            </form>
        </div>
    );
}
export default FaqCreate;
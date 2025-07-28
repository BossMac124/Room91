import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {useParams} from "react-router-dom";

const News = ({ }) => {
    const { newsId } = useParams();
    const [news, setNews] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 뉴스 데이터를 가져오는 함수
        const fetchNews = async () => {
            try {
                const response = await axios.get(`/api/news/${newsId}`);
                setNews(response.data);
            } catch (err) {
                setError('뉴스를 불러오는 중 오류가 발생했습니다.');
            }
        };

        if (newsId) fetchNews(); // ✅ newsId 있을 때만 호출
    }, [newsId]);

    if (error) {
        return <div>{error}</div>;
    }

    if (!news) {
        return <div>로딩 중...</div>;
    }

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1>Room91 뉴스 속보</h1>
            </header>

            <div style={styles.content}>
                <h2>뉴스 영상</h2>
                <video controls style={styles.video}>
                    <source src={`${baseUrl}/api/news/video/${newsId}`} type="video/mp4" />
                    브라우저가 video 태그를 지원하지 않습니다.
                </video>

                <h2>뉴스 기사</h2>
                <p>{news.newsText}</p>
            </div>

            <footer style={styles.footer}>
                © 2025 Room91 News. 모든 권리 보유.<br />
                문의 사항이 있으시면 언제든지 이메일로 연락 주세요.<br />
                <a href="mailto:cap019@naver.com" style={styles.emailLink}>이메일 보내기</a>
            </footer>
        </div>
    );
};

const styles = {
    container: {
        fontFamily: "'Noto Sans KR', sans-serif",
        backgroundColor: '#f9f9f9',
        margin: 0,
        padding: 0,
    },
    header: {
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '1px',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    content: {
        maxWidth: '900px',
        margin: '40px auto',
        backgroundColor: '#ffffff',
        padding: '30px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
    },
    video: {
        width: '100%',
        height: 'auto',
        marginBottom: '30px',
        borderRadius: '8px',
        border: '1px solid #ccc',
    },
    footer: {
        textAlign: 'center',
        padding: '30px 20px',
        fontSize: '0.95rem',
        color: '#666',
        backgroundColor: '#f0f0f0',
        marginTop: '40px',
    },
    emailLink: {
        display: 'inline-block',
        marginTop: '10px',
        padding: '10px 20px',
        backgroundColor: '#2c3e50',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '5px',
        transition: 'background-color 0.3s ease',
    },
};

export default News;
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const NewsList = () => {
    const [newsList, setNewsList] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchNewsList = async () => {
            try {
                const res = await axios.get(`/api/news`);
                if (isMounted && Array.isArray(res.data)) {
                    setNewsList(res.data);
                }
            } catch (err) {
                if (isMounted) {
                    setError('뉴스 목록을 불러오는 중 오류가 발생했습니다.');
                }
            }
        };

        fetchNewsList();

        return () => {
            isMounted = false;
        };
    }, []);

    if (error) return <div>{error}</div>;
    if (!newsList || !newsList.length) return <div>뉴스를 불러오는 중...</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '40px auto' }}>
            <h1>Room91 뉴스 목록</h1>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {newsList.map((news) => (
                    <li key={news.id} style={styles.card}>
                        <Link to={`/news/${news.id}`} style={styles.link}>
                            <h3>{news.createdAt ? news.createdAt.slice(0, 10) : "날짜 없음"} 뉴스</h3>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const styles = {
    card: {
        backgroundColor: '#fff',
        marginBottom: '20px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderRadius: '8px',
    },
    link: {
        textDecoration: 'none',
        color: '#333',
    },
};

export default NewsList;

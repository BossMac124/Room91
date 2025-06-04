import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    const styles = {
        header: {
            width: '100%',              // 화면 전체 넓이
            backgroundColor: '#FF6B3D',
            borderBottom: '1px solid #ddd',
            padding: '10px 0',          // 위아래 패딩 좀 키움
            boxSizing: 'border-box',
            position: 'sticky',         // 스크롤 시 고정하고 싶으면
            top: 0,
            zIndex: 1000,
        },
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0px',          // 좌우 패딩 주기 (모바일 대비)
            boxSizing: 'border-box',
        },
        logo: {
            height: '60px',
        },
        navList: {
            listStyle: 'none',
            display: 'flex',
            gap: '30px',
            margin: 0,
            padding: 0,
        },
        link: {
            textDecoration: 'none',
            color: '#fff',              // 흰색으로 바꾸면 대비 좋아짐
            fontWeight: 'bold',
            fontSize: '1rem',
            transition: 'color 0.3s',
        },
        linkHover: {
            color: '#ffe6d1',           // 호버 시 연한 색으로 변하게
        }
    };

    return (
        <header style={styles.header}>
            <div style={styles.container}>
                <div>
                    <img src="/images/logo.png" alt="로고" style={styles.logo} />
                </div>
                <nav>
                    <ul style={styles.navList}>
                        <li><Link to="/" style={styles.link}>메인</Link></li>
                        <li><Link to="/Redevelopment" style={styles.link}>재개발</Link></li>
                        <li><Link to="/room" style={styles.link}>원룸/투룸</Link></li>

                        <li className="dropdown">
                            <span className="dropdown-title">공지&FAQ</span>
                            <div className="dropdown-content">
                                <Link to="/notice">공지사항</Link>
                                <Link to="/faq">FAQ</Link>
                            </div>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
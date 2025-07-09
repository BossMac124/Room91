import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    const [roomOpen, setRoomOpen] = useState(false);
    const [noticeOpen, setNoticeOpen] = useState(false);

    const styles = {
        header: {
            width: '100%',
            backgroundColor: '#FF6B3D',
            borderBottom: '1px solid #ddd',
            padding: '10px 0',
            boxSizing: 'border-box',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
        },
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0px',
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
        navItem: {
            position: 'relative',
        },
        link: {
            textDecoration: 'none',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1rem',
            transition: 'color 0.3s',
            cursor: 'pointer',
        },
        dropdown: {
            position: 'absolute',
            top: '100%',
            left: 0,
            backgroundColor: '#fff',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '4px',
            minWidth: '120px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            zIndex: 999,
        },
        dropdownItem: {
            display: 'block',
            padding: '10px',
            textDecoration: 'none',
            color: '#333',
            fontSize: '0.95rem',
            whiteSpace: 'nowrap',
        }
    };

    return (
        <header style={styles.header}>
            <div style={styles.container}>
                <div>
                    <Link to="/">
                        <img src="/images/logo.png" alt="로고" style={styles.logo} />
                    </Link>
                </div>
                <nav>
                    <ul style={styles.navList}>
                        <li style={styles.navItem}>
                            <Link to="/news" style={styles.link}>뉴스</Link>
                        </li>
                        <li style={styles.navItem}>
                            <Link to="/Redevelopment" style={styles.link}>재개발</Link>
                        </li>
                        <li
                            style={styles.navItem}
                            onMouseEnter={() => setRoomOpen(true)}
                            onMouseLeave={() => setRoomOpen(false)}
                        >
                            <span style={styles.link}>원룸/투룸</span>
                            {roomOpen && (
                                <div style={styles.dropdown}>
                                    <Link to="/one" style={styles.dropdownItem}>원룸</Link>
                                    <Link to="/two" style={styles.dropdownItem}>투룸</Link>
                                </div>
                            )}
                        </li>
                        <li
                            style={styles.navItem}
                            onMouseEnter={() => setNoticeOpen(true)}
                            onMouseLeave={() => setNoticeOpen(false)}
                        >
                            <span style={styles.link}>공지&FAQ</span>
                            {noticeOpen && (
                                <div style={styles.dropdown}>
                                    <Link to="/notice" style={styles.dropdownItem}>공지사항</Link>
                                    <Link to="/faq" style={styles.dropdownItem}>FAQ</Link>
                                </div>
                            )}
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;

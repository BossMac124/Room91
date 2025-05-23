import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    const styles = {
        header: {
            width: '100vw',
            backgroundColor: '#FF6B3D',
            borderBottom: '1px solid #ddd',
            padding: '5px',
        },
        container: {
            maxWidth: '1300px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0px',
        },
        logo: {
            height: '50px',
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
            color: 'black',
            fontWeight: 'bold',
        },
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
                        <li><Link to="/notice" style={styles.link}>공지&FAQ</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
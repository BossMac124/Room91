import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import "./css/ckeditor.css"; // CKEditor 전역 오버라이드
import App from './App.jsx';

ReactDOM.render(
    <StrictMode>
        <App />
    </StrictMode>,
    document.getElementById('root')
);

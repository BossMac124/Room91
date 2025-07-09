import { BrowserRouter, Routes, Route } from "react-router-dom"
import './css/App.css'
import NoticeCreate from "./component/Notice/NoticeCreate.jsx";
import Header from "./component/Header.jsx";
import Redevelopment from "./component/Redevelopment/Redevelopment.jsx";
import NoticePage from "./component/Notice/NoticePage.jsx";
import FaqCreate from './component/Faq/FaqCreate.jsx';
import FaqPage from "./component/Faq/FaqPage.jsx";
import MapPage from "./component/MapPage.jsx";

function App() {
  return (
      <BrowserRouter>
          <Header />
          <Routes>
              <Route path="/" element={<h1 style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100vh', // 화면 전체 높이
              }}>메인 화면 준비중입니다.</h1>} />
              <Route path="/notice" element={<NoticePage />} />
              <Route path="/notice/create" element={<NoticeCreate />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/faq/create" element={<FaqCreate />} />
              <Route path="/Redevelopment" element={<Redevelopment />} />
              <Route path="/one" element={<MapPage />} />
          </Routes>
      </BrowserRouter>
  )
}

export default App;
import { BrowserRouter, Routes, Route } from "react-router-dom"
import './css/App.css'
import NoticeCreate from "./component/NoticeCreate.jsx";
import Header from "./component/Header.jsx";
import Redevelopment from "./component/Redevelopment.jsx";
import NoticePage from "./Notice/NoticePage.jsx";

function App() {
  return (
      <BrowserRouter>
          <Header />
          <Routes>
              <Route path="/" element={<h1>메인 화면 준비중입니다.</h1>} />
              <Route path="/notice" element={<NoticePage />} />
              <Route path="/notice/create" element={<NoticeCreate />} />
              <Route path="/Redevelopment" element={<Redevelopment />} />
          </Routes>
      </BrowserRouter>
  )
}

export default App;
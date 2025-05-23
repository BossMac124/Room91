import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import './css/App.css'
import Notice from "./component/Notice.jsx";
import NoticeCreate from "./component/NoticeCreate.jsx";
import Header from "./component/Header.jsx";
import Redevelopment from "./component/Redevelopment.jsx";

function App() {
  return (
      <BrowserRouter>
          <Header />
          <Routes>
              <Route path="/" element={<div>홈페이지입니다</div>} />
              <Route path="/notice" element={<Notice />} />
              <Route path="/notice/create" element={<NoticeCreate />} />
              <Route path="/Redevelopment" element={<Redevelopment />} />
          </Routes>
      </BrowserRouter>
  )
}

export default App;
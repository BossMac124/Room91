import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import './css/App.css'
import Notice from "./component/Notice.jsx";
import NoticeCreate from "./component/NoticeCreate.jsx";

function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route path="/api/notice" element={<Notice />} />
              <Route path="/notice/create" element={<NoticeCreate />} />
          </Routes>
      </BrowserRouter>
  )
}

export default App;
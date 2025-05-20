import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import './css/App.css'
import Notice from "./component/Notice.jsx";

function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route path="/api/notice" element={<Notice />} />
          </Routes>
      </BrowserRouter>
  )
}

export default App;
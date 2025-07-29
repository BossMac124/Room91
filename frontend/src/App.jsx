import { BrowserRouter, Routes, Route } from "react-router-dom"
import './css/App.css'
import NoticeCreate from "./component/Notice/NoticeCreate.jsx";
import Header from "./component/Header.jsx";
import Redevelopment from "./component/Redevelopment/Redevelopment.jsx";
import NoticePage from "./component/Notice/NoticePage.jsx";
import FaqCreate from './component/Faq/FaqCreate.jsx';
import FaqPage from "./component/Faq/FaqPage.jsx";
import MapPage from "./component/Oneroom/MapPage.jsx";
import News from "./component/News/News.jsx";
import NewsList from "./component/News/NewsList.jsx";
import Register from "./component/Sign/Register.jsx";
import Login from "./component/Sign/Login.jsx";

function App() {
  return (
      <BrowserRouter>
          <Header />
          <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/notice" element={<NoticePage />} />
              <Route path="/notice/create" element={<NoticeCreate />} />
              <Route path="/faq/create" element={<FaqCreate />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/Redevelopment" element={<Redevelopment />} />
              <Route path="/one" element={<MapPage />} />
              <Route path="/news" element={<NewsList />} />
              <Route path="/news/:newsId" element={<News />} />
          </Routes>
      </BrowserRouter>
  )
}

export default App;
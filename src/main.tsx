import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './login.tsx'
import './index.css'
import { ToolProvider } from './component/ToolContext';
import { ColorProvider } from './component/ColorContext';
import App from './App';
import Lobby from './lobby';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToolProvider>
        <ColorProvider>
        <Routes>
          <Route path="/" element={<Login />} /> {/* "/" 경로에는 로그인 페이지가 나오도록 설정 */}
          <Route path='/lobby' element={<Lobby />} />
          <Route path="/app" element={<App />} />
        </Routes>
      </ColorProvider>
    </ToolProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

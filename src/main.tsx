import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './login.tsx'
import './index.css'
import { ToolProvider } from './component/ToolContext';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToolProvider>
        <Routes>
          <Route path="/" element={<Login />} /> {/* "/" 경로에는 로그인 페이지가 나오도록 설정 */}
          <Route path="/app" element={<App />} />
        </Routes>
      </ToolProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

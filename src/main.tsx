import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToolProvider } from './component/ToolContext';
import { ColorProvider } from './component/ColorContext';
import './index.css'
import Login from './login.tsx'
import SignUp from './signup.tsx';
import Lobby from './lobby';
import App from './App';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

let theme = createTheme({
  palette: {
    primary: {
      main: '#DBE0E6',  // 그레이
    },
    secondary: {
      main: '#E1E5EA',  // 라이트 그레이
    },
    info: {
      main: '#FF7A50', // 주황
      // main: '#5061ff', // 파랑
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
    <CssBaseline/>
    <BrowserRouter>
        <ToolProvider>
          <ColorProvider>
            <Routes>
              <Route path="/" element={<Login />} /> {/* "/" 경로에는 로그인 페이지가 나오도록 설정 */}
              <Route path="/signup" element={<SignUp />}/>
              <Route path='/lobby' element={<Lobby />} />
              <Route path="/app" element={<App />} />
            </Routes>
          </ColorProvider>
        </ToolProvider>
    </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)

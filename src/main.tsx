import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './login.tsx'
import './index.css'
import { ToolProvider } from './component/ToolContext';
import { ColorProvider } from './component/ColorContext';
import App from './App';
import Lobby from './lobby';
import { ThemeProvider, unstable_createMuiStrictModeTheme } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

let theme = createTheme({
  palette: {
    primary: {
      main: '#0052cc',
    },
    secondary: {
      main: '#edf2ff',
    },
  },
});

theme = createTheme(theme, {
  palette: {
    info: {
      main: theme.palette.secondary.main,
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
              <Route path='/lobby' element={<Lobby />} />
              <Route path="/app" element={<App />} />
            </Routes>
          </ColorProvider>
        </ToolProvider>
    </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)

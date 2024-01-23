import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ToolProvider } from './component/ToolContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToolProvider>
      <App />
    </ToolProvider>
  </React.StrictMode>,
)

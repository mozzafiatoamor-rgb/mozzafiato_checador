import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registro manual de Service Worker (sin virtual:pwa-register)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const basePath = import.meta.env.VITE_BASE_PATH || '/checador-mozzafiato/';
    navigator.serviceWorker.register(`${basePath}sw.js`).catch((err) => {
      console.warn('SW registration failed:', err);
    });
  });
}

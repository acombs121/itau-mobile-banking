import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Chunk Preload Auto-Recovery Listener for Cloud Run deployments
window.addEventListener('vite:preloadError', () => {
  console.warn('Vite preload error detected. Reloading application to fetch latest bundle...');
  window.location.reload();
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

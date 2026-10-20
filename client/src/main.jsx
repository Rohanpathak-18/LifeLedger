import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './app/App.jsx';
import { AuthProvider } from './app/providers.jsx';
import './index.css';
import './styles/overrides.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{ style: { background: '#242321', color: '#f5f2eb' } }}
      />
    </BrowserRouter>
  </React.StrictMode>,
);

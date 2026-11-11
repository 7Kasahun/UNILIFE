import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { PwaProvider } from './context/PwaContext.jsx';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PwaProvider>
          <App />
        </PwaProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

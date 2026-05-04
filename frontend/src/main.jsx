import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App.jsx';
import { AuthProvider } from './context/AuthContext';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>   {/* ✅ THIS IS REQUIRED */}
    <App />
  </AuthProvider>
);
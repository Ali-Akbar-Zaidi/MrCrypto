import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/auth';
import Login from './components/index';
import Home from './components/HomePage';
import ForgotCredentials from './components/ForgotCredentials';
import PredictETH from './components/PredictETH';
import PredictBTC from './components/PredictBTC';
import Profile from './components/Profile';
import Trade from './components/Trade';

// Redirects to /login if user is not authenticated
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="forgotCredentials" element={<ForgotCredentials />} />
          <Route path="predictETH" element={<PredictETH />} />
          <Route path="predictBTC" element={<PredictBTC />} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="trade" element={<ProtectedRoute><Trade /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

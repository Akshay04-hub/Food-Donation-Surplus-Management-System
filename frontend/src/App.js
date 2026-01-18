import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import DonorTypeSelection from './pages/DonorTypeSelection';
import DashboardPage from './pages/DashboardPage';
import PointsPage from './pages/PointsPage';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="app-accent-stripe" />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected routes */}
          <Route
            path="/select-role"
            element={<PrivateRoute element={<RoleSelectionPage />} />}
          />
          <Route
            path="/donor-type-selection"
            element={<DonorTypeSelection />}
          />
          <Route
            path="/dashboard"
            element={<PrivateRoute element={<DashboardPage />} />}
          />
          <Route
            path="/points-history"
            element={<PrivateRoute element={<PointsPage />} />}
          />
          <Route
            path="/admin-dashboard"
            element={<PrivateRoute element={<AdminDashboard />} />}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './features/auth';
import './App.scss';
import DashboardPage from './features/dashboard/dashboard.page';
import TwosComplementPage from './features/tasks/twosComplement/twoscomplement.page';
import AuthPage from './features/auth/auth.page';
import ResetPasswordPage from './features/auth/reset.page';
import NumberSystemPage from './features/tasks/number-system/NumberSystem.page';
import DataPackagePage from './features/tasks/dataPackage/DataPackage.page';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes - nur für nicht angemeldete Nutzer */}
          <Route 
            path="/auth/login" 
            element={
              <ProtectedRoute requireAuth={false}>
                <AuthPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/auth/register" 
            element={
              <ProtectedRoute requireAuth={false}>
                <AuthPage />
              </ProtectedRoute>
            } 
          />

          {/* Password reset landing route */}
          <Route 
            path="/auth/reset" 
            element={
              <ProtectedRoute requireAuth={false}>
                <ResetPasswordPage />
              </ProtectedRoute>
            } 
          />

          {/* Protected Routes - nur für angemeldete Nutzer */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/tasks/data-package" 
            element={
              <ProtectedRoute>
                <DataPackagePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/tasks/twos-complement" 
            element={
              <ProtectedRoute>
                <TwosComplementPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/tasks/number-system" 
            element={
              <ProtectedRoute>
                <NumberSystemPage />
              </ProtectedRoute>
            } 
          />

          {/* Root Route - Redirect basierend auf Auth Status */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch all route - Redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.scss';
import DashboardPage from './features/dashboard/dashboard.page';
import DataPackagePage from './features/tasks/dataPackage/datapackage.page';
import TwosComplementPage from './features/tasks/twosComplement/twoscomplement.page';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Dashboard route */}
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Task routes */}
          <Route path="/tasks/data-package" element={<DataPackagePage />} />
          <Route path="/tasks/twos-complement" element={<TwosComplementPage />} />
          
          {/* Catch all route - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

import React from 'react';
import {useTheme} from './shared/hooks/useTheme';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import TopNavbar from './shared/components/TopNavbar/TopNavbar.component';
import {AuthProvider, ProtectedRoute} from './features/auth';
import './App.scss';
import DashboardPage from './features/dashboard/dashboard.page';
import AuthPage from './features/auth/auth.page';
import ResetPasswordPage from './features/auth/reset.page';
import PracticeTaskOnePage from './features/tasks/practiceTaskOne/PracticeTaskOne.page';
import PracticeTaskTwoPage from './features/tasks/practiceTaskTwo/PracticeTaskTwo.page';
import HelperModulePage from './features/helpers/HelperModule.page';
import {TaskId} from './shared/enums/taskId.enum';

const App: React.FC = () => {
  // Initialize theme handling (forced to dark by useTheme implementation)
  useTheme();
  return (
    <AuthProvider>
      <Router>
        {/* Theme toggle removed; app runs in dark mode */}
        <AppWithNavbar />
      </Router>
    </AuthProvider>
  );
};

const AppWithNavbar: React.FC = () => {
  const location = useLocation();
  const hideNavbarOn = ['/dashboard'];

  return (
    <>
      {hideNavbarOn.includes(location.pathname) ? null : <TopNavbar />}
      <Routes>
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

        {/* Helper modules */}
        <Route
          path="/hilfsmodul/:module"
          element={
            <ProtectedRoute>
              <HelperModulePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/practice-task-one"
          element={
            <ProtectedRoute>
              <PracticeTaskOnePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/practice-task-two"
          element={
            <ProtectedRoute>
              <PracticeTaskTwoPage />
            </ProtectedRoute>
          }
        />

        {/* Direct links into specific Practice Task One subtasks */}
        <Route
          path="/task/number-system"
          element={
            <ProtectedRoute>
              <PracticeTaskOnePage initialSubTask={TaskId.NumberSystem} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/task/positive-arithmetic"
          element={
            <ProtectedRoute>
              <PracticeTaskOnePage initialSubTask={TaskId.PositiveArithmetic} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/task/twos-complement-arithmetic"
          element={
            <ProtectedRoute>
              <PracticeTaskOnePage
                initialSubTask={TaskId.TwosComplementArithmetic}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/task/complements"
          element={
            <ProtectedRoute>
              <PracticeTaskOnePage initialSubTask={TaskId.Complements} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/task/quiz"
          element={
            <ProtectedRoute>
              <PracticeTaskOnePage initialSubTask={TaskId.Quiz} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/task/von-neumann"
          element={
            <ProtectedRoute>
              <PracticeTaskTwoPage initialSubTask={TaskId.VonNeumann} />
            </ProtectedRoute>
          }
        />

        {/* Root Route - Redirect basierend auf Auth Status */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Catch all route - Redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
};

export default App;

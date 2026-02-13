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
import {
  AuthProvider,
  ProtectedRoute,
  TopicGuard,
  useAuth,
} from './features/auth';
import {BadgeNotificationProvider} from './shared/context/BadgeNotificationContext';
import {UserBadgesProvider} from './shared/context/UserBadgesContext';
import BadgeCelebrationPopup from './shared/components/BadgeCelebrationPopup/BadgeCelebrationPopup.component';
import './App.scss';
import DashboardPage from './features/dashboard/dashboard.page';
import AuthPage from './features/auth/auth.page';
import ResetPasswordPage from './features/auth/reset.page';
import HelperModulePage from './features/helpers/HelperModule.page';
import OnboardingPage from './features/onboarding/onboarding.page';
import {TaskId} from './shared/enums/taskId.enum';
import {useOrientation} from './shared/hooks/useOrientation';
import OrientationOverlay from './shared/components/OrientationOverlay/OrientationOverlay';
import { ProfessorDashboardPage } from './features/professor-dashboard';
import MicroProcessorPage from './features/tasks/microprocessor/MicroProcessor.page';
import NumberRepresentation from './features/tasks/number-representation/NumberRepresentation.page';

const App: React.FC = () => {
  // Initialize theme handling (forced to dark by useTheme implementation)
  useTheme();

  // Check device orientation - show overlay on mobile/tablet devices in portrait mode
  const {isPortrait} = useOrientation();
  const isMobileOrTablet =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    (window.matchMedia('(max-width: 1024px)').matches ||
      window.matchMedia('(pointer: coarse)').matches);

  const shouldShowOrientationOverlay = isMobileOrTablet && isPortrait;

  return (
    <AuthProvider>
      <AppShell shouldShowOrientationOverlay={shouldShowOrientationOverlay} />
    </AuthProvider>
  );
};

/**
 * Inner shell that has access to AuthContext so we can pass
 * `isAuthenticated` to the BadgeNotificationProvider.
 */
const AppShell: React.FC<{shouldShowOrientationOverlay: boolean}> = ({
  shouldShowOrientationOverlay,
}) => {
  const {user} = useAuth();

  return (
    <BadgeNotificationProvider isAuthenticated={!!user}>
      <UserBadgesProvider isAuthenticated={!!user}>
        <Router>
          {shouldShowOrientationOverlay && <OrientationOverlay />}
          <BadgeCelebrationPopup />
          <AppWithNavbar />
        </Router>
      </UserBadgesProvider>
    </BadgeNotificationProvider>
  );
};

const AppWithNavbar: React.FC = () => {
  const location = useLocation();
  const hideNavbarOn = ['/dashboard', '/onboarding', '/professor-dashboard'];

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

        {/* Onboarding – shown once before the first dashboard visit */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
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

        {/* Professor Dashboard – admin only (guard inside page) */}
        <Route
          path="/professor-dashboard"
          element={
            <ProtectedRoute>
              <ProfessorDashboardPage />
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
              <NumberRepresentation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/practice-task-two"
          element={
            <ProtectedRoute>
              <MicroProcessorPage />
            </ProtectedRoute>
          }
        />

        {/* Direct links into specific Practice Task One subtasks */}
        <Route
          path="/task/number-system"
          element={
            <ProtectedRoute>
              <NumberRepresentation initialSubTask={TaskId.NumberSystem} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/task/positive-arithmetic"
          element={
            <ProtectedRoute>
              <NumberRepresentation initialSubTask={TaskId.PositiveArithmetic} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/task/twos-complement-arithmetic"
          element={
            <ProtectedRoute>
              <NumberRepresentation
                initialSubTask={TaskId.TwosComplementArithmetic}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/task/complements"
          element={
            <ProtectedRoute>
              <NumberRepresentation initialSubTask={TaskId.Complements} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/task/fixed-floating-point"
          element={
            <ProtectedRoute>
              <NumberRepresentation initialSubTask={TaskId.FixedFloatingPoint} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/task/quiz"
          element={
            <ProtectedRoute>
              <NumberRepresentation initialSubTask={TaskId.Quiz} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/task/von-neumann"
          element={
            <ProtectedRoute>
              <TopicGuard
                requiredCategory="zahlendarstellung"
                requiredLevel="bronze">
                <MicroProcessorPage initialSubTask={TaskId.VonNeumann} />
              </TopicGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/task/read-assembly"
          element={
            <ProtectedRoute>
              <TopicGuard
                requiredCategory="zahlendarstellung"
                requiredLevel="bronze">
                <MicroProcessorPage initialSubTask={TaskId.ReadAssembly} />
              </TopicGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/task/write-assembly"
          element={
            <ProtectedRoute>
              <TopicGuard
                requiredCategory="zahlendarstellung"
                requiredLevel="bronze">
                <MicroProcessorPage initialSubTask={TaskId.WriteAssembly} />
              </TopicGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/task/java-to-assembly"
          element={
            <ProtectedRoute>
              <TopicGuard
                requiredCategory="zahlendarstellung"
                requiredLevel="bronze">
                <MicroProcessorPage initialSubTask={TaskId.JavaToAssembly} />
              </TopicGuard>
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

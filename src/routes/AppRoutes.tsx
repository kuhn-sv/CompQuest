import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import TopNavbar from '../shared/components/ui/top-navbar/TopNavbar.component';
import { ProtectedRoute, TopicGuard } from '../features/auth';
import DashboardPage from '../features/dashboard/dashboard.page';
import AuthPage from '../features/auth/auth.page';
import ResetPasswordPage from '../features/auth/reset.page';
import HelperModulePage from '../features/helpers/HelperModule.page';
import OnboardingPage from '../features/onboarding/onboarding.page';
import { TaskId } from '../shared/enums/taskId.enum';
import { ProfessorDashboardPage } from '../features/professor-dashboard';
import GenericTaskPage from '../features/tasks/shared/pages/GenericTask.page';
import { microprocessorConfig } from '../features/tasks/microprocessor/config/microprocessor.config';
import { numberRepresentationConfig } from '@/features/tasks/number-representation/config/numberRepresentation.config';

const AppRoutes: React.FC = () => {
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
              <GenericTaskPage subTaskConfigs={numberRepresentationConfig} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/practice-task-two"
          element={
            <ProtectedRoute>
              <GenericTaskPage subTaskConfigs={microprocessorConfig} />
            </ProtectedRoute>
          }
        />

        {/* Direct links into specific Practice Task One subtasks */}
        <Route
          path="/task/number-system"
          element={
            <ProtectedRoute>
              <GenericTaskPage
                subTaskConfigs={numberRepresentationConfig}
                initialSubTask={TaskId.NumberSystem}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/task/positive-arithmetic"
          element={
            <ProtectedRoute>
              <GenericTaskPage
                subTaskConfigs={numberRepresentationConfig}
                initialSubTask={TaskId.PositiveArithmetic}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/task/twos-complement-arithmetic"
          element={
            <ProtectedRoute>
              <GenericTaskPage
                subTaskConfigs={numberRepresentationConfig}
                initialSubTask={TaskId.TwosComplementArithmetic}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/task/complements"
          element={
            <ProtectedRoute>
              <GenericTaskPage
                subTaskConfigs={numberRepresentationConfig}
                initialSubTask={TaskId.Complements}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/task/fixed-floating-point"
          element={
            <ProtectedRoute>
              <GenericTaskPage
                subTaskConfigs={numberRepresentationConfig}
                initialSubTask={TaskId.FixedFloatingPoint}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/task/quiz"
          element={
            <ProtectedRoute>
              <GenericTaskPage
                subTaskConfigs={numberRepresentationConfig}
                initialSubTask={TaskId.Quiz}
              />
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
                <GenericTaskPage
                  subTaskConfigs={microprocessorConfig}
                  initialSubTask={TaskId.VonNeumann}
                />
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
                <GenericTaskPage
                  subTaskConfigs={microprocessorConfig}
                  initialSubTask={TaskId.ReadAssembly}
                />
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
                <GenericTaskPage
                  subTaskConfigs={microprocessorConfig}
                  initialSubTask={TaskId.WriteAssembly}
                />
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
                <GenericTaskPage
                  subTaskConfigs={microprocessorConfig}
                  initialSubTask={TaskId.JavaToAssembly}
                />
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

export default AppRoutes;

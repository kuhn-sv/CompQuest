import React, {useState, useEffect, useCallback, Suspense} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import ExercisesModal from './components/ExercisesModal.component';
import DashboardHeader from './components/DashboardHeader.component';
import SettingsModal from './components/SettingsModal.component';
import InstructionsOverlay from './components/InstructionsOverlay.component';
import PerformanceWarning from './components/PerformanceWarning.component';
import ViewToggleButton from './components/ViewToggleButton.component';
import {Toast} from '../../shared/components/Toast/Toast.component';
import {useAuth} from '../auth';
import {useSettingsModal} from './hooks/useSettingsModal';
import {useViewMode} from './hooks/useViewMode';
import './dashboard.page.scss';
import type {DashboardNavigationState} from '../../shared/interfaces';
const Model3D = React.lazy(
  () => import('./components/model3d/model3d.component'),
);
import {BoardWithHotspots} from '../../shared/components';

const DashboardPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showExercises, setShowExercises] = useState(false);

  const {user, userProfile} = useAuth();
  const {
    showSettings,
    openSettings,
    closeSettings,
    handleSignOut,
    handleNavigateToAdmin,
    isAdmin,
    leaderboardOptIn,
    handleLeaderboardOptInChange,
    toastMessages,
    dismissToast,
  } = useSettingsModal();
  const {
    is3DView,
    showPerformanceWarning,
    handleToggleView,
    handleCriticalPerformance,
    isTablet,
  } = useViewMode();

  useEffect(() => {
    if (userProfile && !userProfile.progress?.hasCompletedOnboarding) {
      navigate('/onboarding', {replace: true});
    }
  }, [userProfile, navigate]);

  // Auto-open exercises modal when navigated with state (e.g. from ResultSummary "Beenden")
  useEffect(() => {
    const navState = location.state as DashboardNavigationState | undefined;
    if (navState?.openExercises) {
      setShowExercises(true);
      // Clear state so a page refresh doesn't re-open the modal
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const handleCpuClick = useCallback(() => {
    setShowExercises(true);
  }, []);

  return (
    <div className="dashboard">
      <DashboardHeader
        displayName={user?.displayName || user?.email || ''}
        onSettingsClick={openSettings}
      />

      <SettingsModal
        show={showSettings}
        onClose={closeSettings}
        onSignOut={handleSignOut}
        isAdmin={isAdmin}
        onNavigateToAdmin={handleNavigateToAdmin}
        leaderboardOptIn={leaderboardOptIn}
        onLeaderboardOptInChange={handleLeaderboardOptInChange}
      />

      <Toast messages={toastMessages} onDismiss={dismissToast} />

      <div className="dashboard__3d-container">
        {is3DView ? (
          <Suspense
            fallback={<div className="dashboard__3d-loading">Lade 3D...</div>}>
            <Model3D
              modelPath="/motherboard__components.glb"
              onCpuClick={handleCpuClick}
              onCriticalPerformance={handleCriticalPerformance}
              className="dashboard__3d-viewer"
            />
          </Suspense>
        ) : (
          <div className="dashboard__2d-wrapper">
            <BoardWithHotspots onCpuClick={handleCpuClick} />
          </div>
        )}

        <PerformanceWarning show={showPerformanceWarning} />
        <InstructionsOverlay />
        <ViewToggleButton
          is3DView={is3DView}
          isTablet={isTablet}
          onToggle={handleToggleView}
        />
      </div>

      <ExercisesModal
        show={showExercises}
        onClose={() => setShowExercises(false)}
        topicTitle="Aufgabenübersicht"
      />
    </div>
  );
};

export default DashboardPage;

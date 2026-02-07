import React, {useState, useEffect, Suspense} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import ExercisesModal from './components/ExercisesModal.component';
import {useAuth} from '../auth';
import './dashboard.page.scss';
import type {DashboardNavigationState} from '../../shared/interfaces';
const Model3D = React.lazy(
  () => import('./components/model3d/model3d.component'),
);
import useDeviceType from '../../shared/hooks/useDeviceType';
import {BoardWithHotspots} from '../../shared/components';
import {TaskId} from '../../shared/enums/taskId.enum';
import {TASK_DISPLAY_NAMES} from '../../shared/constants/taskDisplayNames';

const VIEW_MODE_STORAGE_KEY = 'compquest-view-mode';

const DashboardPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showExercises, setShowExercises] = useState(false);

  const {user, signOut, userProfile} = useAuth();

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
  // Default to 2D to avoid heavy 3D loading on lower-end devices
  const [is3DView, setIs3DView] = useState(false);
  const [showPerformanceWarning, setShowPerformanceWarning] = useState(false);
  const {isTablet} = useDeviceType();

  // Load saved view mode from localStorage on mount
  useEffect(() => {
    const savedViewMode = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (savedViewMode !== null) {
      setIs3DView(savedViewMode === '3D');
    }
  }, []);

  useEffect(() => {
    // On tablets we start with 2D but allow user to switch to 3D
    // The automatic 2D fallback will catch performance issues
    if (isTablet) {
      setIs3DView(false);
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, '2D');
    }
  }, [isTablet]);

  // Handle critical performance - automatically switch to 2D
  const handleCriticalPerformance = () => {
    setIs3DView(false);
    setShowPerformanceWarning(true);
    // Save 2D mode to localStorage when automatically switched due to performance
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, '2D');

    // Hide warning after 10 seconds
    setTimeout(() => {
      setShowPerformanceWarning(false);
    }, 10000);
  };

  // Toggle view mode and save to localStorage
  const handleToggleView = () => {
    const newViewMode = !is3DView;
    setIs3DView(newViewMode);
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, newViewMode ? '3D' : '2D');
  };

  const missions = [
    {
      id: TaskId.NumberSystem,
      title: TASK_DISPLAY_NAMES[TaskId.NumberSystem],
      description: 'Konvertiere zwischen binär, oktal & hexadezimal um.',
      path: '/task/number-system',
      progressPercent: 100,
    },
    {
      id: TaskId.PositiveArithmetic,
      title: TASK_DISPLAY_NAMES[TaskId.PositiveArithmetic],
      description: 'Addiere in binär, oktal & hexadezimal.',
      path: '/task/positive-arithmetic',
      progressPercent: 72,
    },
    {
      id: TaskId.Complements,
      title: TASK_DISPLAY_NAMES[TaskId.Complements],
      description: 'Stelle negative Zahlen im Binärsystem dar.',
      path: '/task/complements',
      progressPercent: 0,
    },
    {
      id: TaskId.TwosComplementArithmetic,
      title: TASK_DISPLAY_NAMES[TaskId.TwosComplementArithmetic],
      description:
        'Wende das Zweierkomplement in Rechnungen an und verstehe Vorzeichenoperationen.',
      path: '/task/twos-complement-arithmetic',
      progressPercent: 0,
    },
    {
      id: TaskId.Quiz,
      title: TASK_DISPLAY_NAMES[TaskId.Quiz],
      description:
        'Tim hat ein paar Fragen zu dem Thema. Kannst du sie beantworten?',
      path: '/task/quiz',
      progressPercent: 0,
    },
  ];

  const helpers = [
    {
      id: TaskId.HelperPotenzrechner,
      title: 'Hilfsmodul: Potenzrechner',
      description:
        'Stelle Zahlen in Binär/Oktal/Hexadezimal dar – mit Potenzen als Hilfestellung.',
      path: '/hilfsmodul/potenzrechner',
    },
    {
      id: TaskId.HelperUmrechnungshelfer,
      title: 'Hilfsmodul: Umrechnungshelfer',
      description:
        'Umrechnung zwischen Binär ⇆ Oktal ⇆ Hexadezimal (Schritt für Schritt).',
      path: '/hilfsmodul/umrechnungshelfer',
    },
  ];

  const handleCpuClick = () => {
    setShowExercises(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="dashboard">
      {/* User Info & Logout */}
      <div className="dashboard__header">
        <div className="dashboard__user-info">
          <img src="favicon.svg"></img>
          <span className="dashboard__welcome">
            Willkommen, {user?.displayName || user?.email}
          </span>
          <button
            className="dashboard__logout-btn"
            onClick={handleSignOut}
            title="Abmelden">
            Abmelden
          </button>
        </div>
      </div>

      <div className="dashboard__3d-container">
        {is3DView ? (
          /* Load 3D viewer lazily to avoid downloading heavy chunk on tablets */
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

        {/* Performance Warning */}
        {showPerformanceWarning && (
          <div className="dashboard__performance-warning">
            <span className="dashboard__performance-warning-icon">⚠️</span>
            <p className="dashboard__performance-warning-text">
              3D-Ansicht zu langsam für dieses Gerät. Automatisch auf 2D
              gewechselt.
            </p>
          </div>
        )}

        {/* Instructions Overlay */}
        <div className="dashboard__instructions">
          <div className="dashboard__title-container">
            <img src="favicon.svg"></img>
            <h1 className="dashboard__title">CompQuest</h1>
          </div>
          <p className="dashboard__subtitle">Kurzanleitung</p>
          <div className="dashboard__controls">
            <p>🖱️ Klick auf CPU: Übungsaufgaben öffnen</p>
            <p>🖱️ Klick auf 2D/3D: Perspektivenwechsel</p>
            <p>🖱️ Halten + Ziehen in 3D: Modell drehen</p>
          </div>
        </div>
        <button
          className="dashboard__toggle-view-btn"
          onClick={handleToggleView}
          title={
            is3DView
              ? 'Wechsle zu 2D Ansicht'
              : isTablet
                ? 'Wechsle zu 3D Ansicht (bei zu niedriger Performance wird automatisch zurück zu 2D gewechselt)'
                : 'Wechsle zu 3D Ansicht'
          }>
          {is3DView ? <span>2D</span> : <span>3D</span>}
        </button>
      </div>

      <ExercisesModal
        show={showExercises}
        onClose={() => setShowExercises(false)}
        missions={missions}
        helpers={helpers}
        topicTitle="Aufgabenübersicht"
      />
    </div>
  );
};

export default DashboardPage;

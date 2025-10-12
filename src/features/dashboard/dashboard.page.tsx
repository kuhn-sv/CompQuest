import React, {useState, useEffect, Suspense} from 'react';
// import { Link } from 'react-router-dom';
import ExercisesModal from './components/ExercisesModal.component';
import {useAuth} from '../auth';
import './dashboard.page.scss';
const Model3D = React.lazy(
  () => import('./components/model3d/model3d.component'),
);
import useDeviceType from '../../shared/hooks/useDeviceType';
import {BoardWithHotspots} from '../../shared/components';
import {TaskId} from '../../shared/enums/taskId.enum';

const DashboardPage: React.FC = () => {
  const [showExercises, setShowExercises] = useState(false);
  // Default to 2D to avoid heavy 3D loading on lower-end devices
  const [is3DView, setIs3DView] = useState(false);
  const {user, signOut} = useAuth();
  const {isTablet} = useDeviceType();

  useEffect(() => {
    // On tablets we prefer a lightweight 2D fallback to avoid crashes
    if (isTablet) setIs3DView(false);
  }, [isTablet]);

  const missions = [
    {
      id: TaskId.NumberSystem,
      title: 'Zahlensystem-Konverter',
      description: 'Konvertiere zwischen binär, oktal & hexadezimal um.',
      path: '/task/number-system',
      progressPercent: 100,
    },
    {
      id: TaskId.PositiveArithmetic,
      title: 'Positive Arithmetik',
      description: 'Addiere in binär, oktal & hexadezimal.',
      path: '/task/positive-arithmetic',
      progressPercent: 72,
    },
    {
      id: TaskId.Complements,
      title: 'Einer- & Zweierkomplement',
      description: 'Stelle negative Zahlen im Binärsystem dar.',
      path: '/task/complements',
      progressPercent: 0,
    },
    {
      id: TaskId.TwosComplementArithmetic,
      title: 'Zweierkomplement-Arithmetik',
      description:
        'Wende das Zweierkomplement in Rechnungen an und verstehe Vorzeichenoperationen.',
      path: '/task/twos-complement-arithmetic',
      progressPercent: 0,
    },
    {
      id: TaskId.Quiz,
      title: 'Quiz',
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
              className="dashboard__3d-viewer"
            />
          </Suspense>
        ) : (
          <div className="dashboard__2d-wrapper">
            <BoardWithHotspots onCpuClick={handleCpuClick} />
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
        {!isTablet && (
          <button
            className="dashboard__toggle-view-btn"
            onClick={() => setIs3DView(!is3DView)}
            title={
              is3DView ? 'Wechsle zu 2D Ansicht' : 'Wechsle zu 3D Ansicht'
            }>
            {is3DView ? <span>2D</span> : <span>3D</span>}
          </button>
        )}
      </div>

      <ExercisesModal
        show={showExercises}
        onClose={() => setShowExercises(false)}
        missions={missions}
        helpers={helpers}
        topicTitle="1. Zahlendarstellung"
      />
    </div>
  );
};

export default DashboardPage;

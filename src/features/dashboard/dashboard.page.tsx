import React, {useState} from 'react';
// import { Link } from 'react-router-dom';
import ExercisesModal from './components/ExercisesModal.component';
import {useAuth} from '../auth';
import './dashboard.page.scss';
import Model3D from './components/model3d/model3d.component';

const DashboardPage: React.FC = () => {
  const [showExercises, setShowExercises] = useState(false);
  const [is3DView, setIs3DView] = useState(true);
  const {user, signOut} = useAuth();

  const missions = [
    {
      id: 'number-system-direct',
      title: 'Zahlensystem-Konverter',
      description: 'Konvertiere zwischen binär, oktal & hexadezimal um.',
      path: '/task/number-system',
      progressPercent: 100,
    },
    {
      id: 'positive-arithmetic-direct',
      title: 'Positive Arithmetik',
      description: 'Addiere in binär, oktal & hexadezimal.',
      path: '/task/positive-arithmetic',
      progressPercent: 72,
    },
    {
      id: 'complements-direct',
      title: 'Einer- & Zweierkomplement',
      description: 'Stelle negative Zahlen im Binärsystem dar.',
      path: '/task/complements',
      progressPercent: 0,
    },
    {
      id: 'twos-complement-arithmetic',
      title: 'Zweierkomplement-Arithmetik',
      description:
        'Wende das Zweierkomplement in Rechnungen an und verstehe Vorzeichenoperationen.',
      path: '/task/twos-complement-arithmetic',
      progressPercent: 0,
    },
    {
      id: 'quiz',
      title: 'Quiz',
      description:
        'Tim hat ein paar Fragen zu dem Thema. Kannst du sie beantworten?',
      path: '/task/quiz',
      progressPercent: 0,
    },
  ];

  const helpers = [
    {
      id: 'helper-potenzrechner',
      title: 'Hilfsmodul: Potenzrechner',
      description:
        'Stelle Zahlen in Binär/Oktal/Hexadezimal dar – mit Potenzen als Hilfestellung.',
      path: '/hilfsmodul/potenzrechner',
    },
    {
      id: 'helper-umrechnungshelfer',
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
          <Model3D
            modelPath="/motherboard__components.glb"
            onCpuClick={handleCpuClick}
            className="dashboard__3d-viewer"
          />
        ) : (
          <div className="dashboard__2d-wrapper">
            <img
              src="/motherboard_components.png"
              alt="Motherboard 2D Ansicht"
              className="dashboard__2d-viewer"
            />

            {/* 🟩 Klickbarer Bereich über der CPU */}
            <button
              className="dashboard__cpu-hotspot"
              onClick={handleCpuClick}
              title="Klicke auf die CPU, um Übungen zu öffnen"></button>
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
          onClick={() => setIs3DView(!is3DView)}
          title={is3DView ? 'Wechsle zu 2D Ansicht' : 'Wechsle zu 3D Ansicht'}>
          {is3DView ? <span>2D</span> : <span>3D</span>}
        </button>
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

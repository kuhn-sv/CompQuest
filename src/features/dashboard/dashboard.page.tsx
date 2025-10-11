import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
import ExercisesModal from './components/ExercisesModal.component';
import { useAuth } from '../auth';
import './dashboard.page.scss';
import Model3D from './components/model3d/model3d.component';

const DashboardPage: React.FC = () => {
  const [showExercises, setShowExercises] = useState(false);
  const { user, signOut } = useAuth();

  const missions = [
    {
      id: 'number-system-direct',
      title: 'Zahlensystem-Konverter',
      description: 'Wandeln zwischen verschiedenen Zahlensystemen um und festige dein Basiswissen.',
      path: '/task/number-system',
      progressPercent: 100,
    },
    {
      id: 'positive-arithmetic-direct',
      title: 'Binäre Arithmetik',
      description: 'Rechne mit Binärzahlen und trainiere Addition, Subtraktion und Überträge.',
      path: '/task/positive-arithmetic',
      progressPercent: 72,
    },
    {
      id: 'complements-direct',
      title: 'Einer- & Zweierkomplement',
      description: 'Direkter Einstieg in Einer- & Zweierkomplement.',
      path: '/task/complements',
      progressPercent: 0,
    },
  ];

  const helpers = [
    {
      id: 'helper-potenzrechner',
      title: 'Hilfsmodul: Potenzrechner',
      description: 'Stelle Zahlen in Binär/Octal/Hex dar – mit Potenzen als Hilfestellung.',
      path: '/hilfsmodul/potenzrechner'
    },
    {
      id: 'helper-umrechnungshelfer',
      title: 'Hilfsmodul: Umrechnungshelfer',
      description: 'Umrechnung Binär ⇆ Hexadezimal (Schritt für Schritt).',
      path: '/hilfsmodul/umrechnungshelfer'
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
          <span className="dashboard__welcome">Willkommen, {user?.displayName || user?.email}</span>
          <button 
            className="dashboard__logout-btn" 
            onClick={handleSignOut}
            title="Abmelden"
          >
            Abmelden
          </button>
        </div>
      </div>

      {/* 3D Viewer Container */}
      <div className="dashboard__3d-container">
        <Model3D 
          modelPath="/motherboard__components.glb"
          onCpuClick={handleCpuClick}
          className="dashboard__3d-viewer"
        />
        
        {/* Instructions Overlay */}
        <div className="dashboard__instructions">
          <h1 className="dashboard__title">CompQuest</h1>
          <p className="dashboard__subtitle">
            Klicken Sie auf die CPU um die Übungsaufgaben zu öffnen
          </p>
          <div className="dashboard__controls">
            <p>🖱️ Halten + Ziehen: Modell drehen</p>
            <p>🖱️ Klick auf CPU: Übungsaufgaben öffnen</p>
          </div>
        </div>
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
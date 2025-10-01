import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import './dashboard.page.scss';
import Model3D from './components/model3d/model3d.component';

const DashboardPage: React.FC = () => {
  const [showExercises, setShowExercises] = useState(false);
  const { user, signOut } = useAuth();

  const exercises = [
    {
      id: 'data-package',
      title: 'Data Package',
      description: 'Übungsaufgabe zum Thema Datenverpackung und Binärdarstellung',
      path: '/tasks/data-package'
    },
    {
      id: 'twos-complement',
      title: 'Zweierkomplement',
      description: 'Übungsaufgabe zum Thema Zweierkomplement und negative Zahlen',
      path: '/tasks/twos-complement'
    }
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

      {/* Exercises Overlay */}
      {showExercises && (
        <div className="dashboard__overlay">
          <div className="dashboard__overlay-content">
            <div className="dashboard__overlay-header">
              <h2>Übungsaufgaben</h2>
              <button 
                className="dashboard__close-btn"
                onClick={() => setShowExercises(false)}
                aria-label="Schließen"
              >
                ✕
              </button>
            </div>
            
            <div className="dashboard__exercises">
              {exercises.map((exercise) => (
                <Link
                  key={exercise.id}
                  to={exercise.path}
                  className="dashboard__exercise-card"
                >
                  <h3 className="dashboard__exercise-title">{exercise.title}</h3>
                  <p className="dashboard__exercise-description">
                    {exercise.description}
                  </p>
                  <div className="dashboard__exercise-arrow">
                    <span>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
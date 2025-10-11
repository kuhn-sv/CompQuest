import React from 'react';
import './ExercisesModal.component.scss';
import ExercisesList, { type Exercise } from './ExercisesList.component';

interface ExercisesModalProps {
  show: boolean;
  onClose: () => void;
  missions: Exercise[];
  helpers: Exercise[];
  topicTitle?: string; // e.g., "1. Zahlendarstellung"
}

const ExercisesModal: React.FC<ExercisesModalProps> = ({ show, onClose, missions, helpers, topicTitle = 'Übungsaufgaben' }) => {
  if (!show) return null;
  return (
    <div className="dashboard__overlay">
      <div className="dashboard__overlay-content">
        <div className="dashboard__overlay-header">
          <h2>{topicTitle}</h2>
          <button 
            className="dashboard__close-btn"
            onClick={onClose}
            aria-label="Schließen"
          >
            ✕
          </button>
        </div>

        <div className="dashboard__section">
          <div className="dashboard__section-title">Missionen</div>
          <ExercisesList exercises={missions} />
        </div>

        <div className="dashboard__section-separator" />

        <div className="dashboard__section">
          <div className="dashboard__section-title">Hilfsmodule</div>
          <ExercisesList exercises={helpers} />
        </div>
      </div>
    </div>
  );
};

export default ExercisesModal;

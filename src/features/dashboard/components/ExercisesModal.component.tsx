import React from 'react';
import './ExercisesModal.component.scss';

interface ExercisesModalProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ExercisesModal: React.FC<ExercisesModalProps> = ({ show, onClose, children }) => {
  if (!show) return null;
  return (
    <div className="dashboard__overlay">
      <div className="dashboard__overlay-content">
        <div className="dashboard__overlay-header">
          <h2>Übungsaufgaben</h2>
          <button 
            className="dashboard__close-btn"
            onClick={onClose}
            aria-label="Schließen"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default ExercisesModal;

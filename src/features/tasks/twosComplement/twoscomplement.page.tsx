import React from 'react';
import { Link } from 'react-router-dom';
import './twoscomplement.page.scss';

const TwosComplementPage: React.FC = () => {
  return (
    <div className="twos-complement-container">
      <div className="twos-complement-header">
        <Link to="/dashboard" className="back-to-dashboard">
          ← Zurück zum Dashboard
        </Link>
        <h1>Zweierkomplement Übung</h1>
      </div>
      
      <div className="twos-complement-content">
        <p>Diese Seite ist bereit für Ihre Implementierung der Zweierkomplement-Übung.</p>
        
        {/* Hier können Sie den Inhalt der Übung implementieren */}
        <div className="exercise-placeholder">
          <h2>Übungsinhalt folgt...</h2>
          <p>Implementieren Sie hier die Zweierkomplement-Aufgaben.</p>
        </div>
      </div>
    </div>
  );
};

export default TwosComplementPage;
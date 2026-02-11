import React from 'react';

const InstructionsOverlay: React.FC = () => (
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
);

export default InstructionsOverlay;

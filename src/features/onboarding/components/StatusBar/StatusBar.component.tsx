import React from 'react';
import './StatusBar.component.scss';

const StatusBar: React.FC = () => (
  <div className="status-bar">
    <span className="status-bar__item status-bar__item--critical">
      <span className="status-bar__icon">⚡</span>
      STATUS: KRITISCH
    </span>
    <span className="status-bar__item status-bar__item--warning">
      <span className="status-bar__icon">⚠</span>
      FEHLER GEFUNDEN
    </span>
  </div>
);

export default StatusBar;

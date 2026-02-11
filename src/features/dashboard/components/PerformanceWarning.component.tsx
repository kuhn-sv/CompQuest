import React from 'react';

interface PerformanceWarningProps {
  show: boolean;
}

const PerformanceWarning: React.FC<PerformanceWarningProps> = ({show}) => {
  if (!show) return null;

  return (
    <div className="dashboard__performance-warning">
      <span className="dashboard__performance-warning-icon">⚠️</span>
      <p className="dashboard__performance-warning-text">
        3D-Ansicht zu langsam für dieses Gerät. Automatisch auf 2D gewechselt.
      </p>
    </div>
  );
};

export default PerformanceWarning;

import React from 'react';
import './OrientationOverlay.scss';

const OrientationOverlay: React.FC = () => {
  return (
    <div className="orientation-overlay">
      <div className="orientation-overlay__content">
        <div className="orientation-overlay__icon">
          <svg 
            width="120" 
            height="120" 
            viewBox="0 0 120 120" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Smartphone icon in portrait orientation */}
            <rect 
              x="35" 
              y="20" 
              width="50" 
              height="80" 
              rx="5" 
              stroke="currentColor" 
              strokeWidth="3" 
              fill="none"
            />
            <circle cx="60" cy="92" r="3" fill="currentColor" />
            
            {/* Rotation arrow */}
            <path 
              d="M 90 45 Q 95 60, 80 65" 
              stroke="currentColor" 
              strokeWidth="3" 
              fill="none" 
              strokeLinecap="round"
            />
            <path 
              d="M 80 65 L 75 60 M 80 65 L 85 70" 
              stroke="currentColor" 
              strokeWidth="3" 
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h2 className="orientation-overlay__title">
          Bitte drehen Sie Ihr Gerät
        </h2>
        <p className="orientation-overlay__message">
          Diese Anwendung ist nur im Querformat verfügbar
        </p>
      </div>
    </div>
  );
};

export default OrientationOverlay;



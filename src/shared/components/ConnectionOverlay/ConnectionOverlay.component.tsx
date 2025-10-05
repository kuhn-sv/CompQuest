import React from 'react';

export interface ConnectionLine {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  taskId: string;
  answerIndex: number;
}

interface ConnectionOverlayProps {
  connectionLines: ConnectionLine[];
}

export const ConnectionOverlay: React.FC<ConnectionOverlayProps> = ({
  connectionLines
}) => {
  if (connectionLines.length === 0) {
    return null;
  }

  return (
    <>
      <svg 
        className="connection-overlay" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {/* Define gradient for consistent line styling */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{stopColor: '#3b82f6', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: '#6366f1', stopOpacity: 1}} />
          </linearGradient>
        </defs>
        
        {connectionLines.map((line) => {
          // Calculate bend points for L-shaped line - extend further left to close gap
          const midX = line.fromX + (line.toX - line.fromX) * 0.3; // Closer to fromX (30% instead of 60%)
                    
          return (
            <g key={`${line.taskId}-${line.answerIndex}`}>
              {/* Horizontal segment from result to bend point */}
              <line
                x1={line.fromX}
                y1={line.fromY}
                x2={midX}
                y2={line.fromY}
                stroke="#3b82f6"
                strokeWidth="3"
              />
              {/* Vertical segment at bend point */}
              <line
                x1={midX}
                y1={line.fromY}
                x2={midX}
                y2={line.toY}
                stroke="#3b82f6"
                strokeWidth="3"
              />
              {/* Horizontal segment from bend point to original position */}
              <line
                x1={midX}
                y1={line.toY}
                x2={line.toX}
                y2={line.toY}
                stroke="#3b82f6"
                strokeWidth="3"
              />
            </g>
          );
        })}
      </svg>
    </>
  );
};
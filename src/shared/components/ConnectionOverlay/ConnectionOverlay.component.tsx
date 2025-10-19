import React from 'react';

export interface ConnectionLine {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  taskId: string;
  answerIndex: number;
  status?: 'correct' | 'wrong';
}

interface ConnectionOverlayProps {
  connectionLines: ConnectionLine[];
}

export const ConnectionOverlay: React.FC<ConnectionOverlayProps> = ({
  connectionLines,
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
        }}>
        {/* Define gradient for consistent line styling */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop
              offset="0%"
              style={{stopColor: 'var(--primary)', stopOpacity: 1}}
            />
            <stop
              offset="100%"
              style={{stopColor: 'var(--primary)', stopOpacity: 1}}
            />
          </linearGradient>
        </defs>

        {connectionLines.map(line => {
          // Calculate bend points for L-shaped line - extend further left to close gap
          const midX = line.fromX + (line.toX - line.fromX) * 0.3; // Closer to fromX (30% instead of 60%)
          let strokeColor = 'var(--primary)';
          if (line.status === 'correct') strokeColor = 'var(--success)';
          if (line.status === 'wrong') strokeColor = 'var(--error)';
          return (
            <g
              key={`${line.taskId}-${line.answerIndex}`}
              data-status={line.status ?? ''}
              className={`connection-line ${line.status ? `connection-line--${line.status}` : ''}`}>
              {/* Horizontal segment from result to bend point */}
              <line
                x1={line.fromX}
                y1={line.fromY}
                x2={midX}
                y2={line.fromY}
                stroke={strokeColor}
                strokeWidth="2"
                className={`connection-seg connection-seg--start ${line.status ? `connection-seg--${line.status}` : ''}`}
              />
              {/* Vertical segment at bend point */}
              <line
                x1={midX}
                y1={line.fromY}
                x2={midX}
                y2={line.toY}
                stroke={strokeColor}
                strokeWidth="2"
                className={`connection-seg connection-seg--bend ${line.status ? `connection-seg--${line.status}` : ''}`}
              />
              {/* Horizontal segment from bend point to original position */}
              <line
                x1={midX}
                y1={line.toY}
                x2={line.toX}
                y2={line.toY}
                stroke={strokeColor}
                strokeWidth="2"
                className={`connection-seg connection-seg--end ${line.status ? `connection-seg--${line.status}` : ''}`}
              />
            </g>
          );
        })}
      </svg>
    </>
  );
};

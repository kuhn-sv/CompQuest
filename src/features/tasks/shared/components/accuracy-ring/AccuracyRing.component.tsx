import React from 'react';
import './AccuracyRing.component.scss';

function getAccuracyColorClass(accuracy: number): string {
  if (accuracy >= 80) return 'high';
  if (accuracy >= 60) return 'medium';
  return 'low';
}

interface AccuracyRingProps {
  /** Accuracy percentage 0–100 */
  accuracy: number;
  /** Diameter in px (default 48) */
  size?: number;
  className?: string;
}

const AccuracyRing: React.FC<AccuracyRingProps> = ({
  accuracy,
  size = 48,
  className,
}) => {
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(accuracy, 0), 100);
  const offset = circumference - (progress / 100) * circumference;
  const colorClass = getAccuracyColorClass(accuracy);

  return (
    <div
      className={`accuracy-ring accuracy-ring--${colorClass} ${className ?? ''}`.trim()}
      style={{width: size, height: size}}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {/* Background circle */}
        <circle
          className="accuracy-ring__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          className="accuracy-ring__fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="accuracy-ring__label">{Math.round(accuracy)}%</span>
    </div>
  );
};

export default AccuracyRing;

import React from 'react';
import './TargetValueDisplay.scss';

export interface TargetValueDisplayProps {
  label?: string;
  value: string | number;
  subLabel?: string;
  subValue?: string;
  className?: string;
}

const TargetValueDisplay: React.FC<TargetValueDisplayProps> = ({
  label = 'Ausgang',
  value,
  subLabel,
  subValue,
}) => {
  return (
    <div className={`target-value-display target-box`.trim()} aria-label="Zielwert">
      {label}: <strong className="mono">{value}</strong>
      {(subLabel || subValue) && (
        <div className="sub">
          {subLabel && `${subLabel}: `}
          {subValue}
        </div>
      )}
    </div>
  );
};

export default TargetValueDisplay;

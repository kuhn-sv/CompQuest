import React from 'react';
import './StepPanel.scss';

export type StepPanelProps = {
  step: number;
  title: string;
  headerRight?: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  ctaVisible?: boolean;
  ctaDirection?: 'up' | 'down';
  ctaAriaLabel?: string;
  children?: React.ReactNode;
  className?: string;
};

const Chevron: React.FC<{ direction?: 'up' | 'down' }> = ({ direction = 'down' }) => (
  <svg
    className={`chevron chevron-${direction}`}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StepPanel: React.FC<StepPanelProps> = ({
  step,
  title,
  headerRight,
  expanded,
  onToggle,
  ctaVisible = false,
  ctaDirection = 'down',
  ctaAriaLabel,
  children,
  className,
}) => {
  return (
    <div className={`uh-step-panel ${expanded ? 'expanded' : 'collapsed'} ${className ?? ''}`.trim()}>
      <div className="uh-step-header">
        <div className="uh-section-title">
          <span className="badge">{step}</span> {title}
        </div>
        {headerRight && <div className="uh-header-right">{headerRight}</div>}
      </div>

      {expanded && (
        <div className="uh-step-content">
          {children}
        </div>
      )}

      {ctaVisible && (
        <button
          type="button"
          className={`uh-step-cta ${expanded ? 'alt' : ''}`}
          aria-label={ctaAriaLabel ?? 'Schritt umschalten'}
          onClick={onToggle}
        >
          <Chevron direction={ctaDirection} />
        </button>
      )}
    </div>
  );
};

export default StepPanel;

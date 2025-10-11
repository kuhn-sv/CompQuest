import React from 'react';
import './TabRow.component.scss';

type Mode = 'binary' | 'octal' | 'hex';

interface TabRowProps {
  mode: Mode;
  onSelect: (mode: Mode) => void;
}

const TabRow: React.FC<TabRowProps> = ({ mode, onSelect }) => {
  return (
    <div className="tabs" role="tablist" aria-label="Darstellungsmodus">
      <button
        className={`tab ${mode === 'binary' ? 'active' : ''}`}
        role="tab"
        aria-selected={mode === 'binary'}
        onClick={() => onSelect('binary')}
      >
        Binär
      </button>
      <button
        className={`tab ${mode === 'octal' ? 'active' : ''}`}
        role="tab"
        aria-selected={mode === 'octal'}
        onClick={() => onSelect('octal')}
      >
        Oktal
      </button>
      <button
        className={`tab ${mode === 'hex' ? 'active' : ''}`}
        role="tab"
        aria-selected={mode === 'hex'}
        onClick={() => onSelect('hex')}
      >
        Hexadezimal
      </button>
    </div>
  );
};

export default TabRow;

import React from 'react';
import './NumberWithBase.component.scss';

export interface NumberWithBaseProps {
  value: string | number;
  base: 2 | 8 | 10 | 16;
  className?: string;
}

const subMap: Record<string, string> = {
  '2': '₂',
  '8': '₈',
  '10': '₁₀',
  '16': '₁₆',
};

const NumberWithBase: React.FC<NumberWithBaseProps> = ({ value, base, className }) => {
  const classes = ['nwb', className].filter(Boolean).join(' ');
  return (
    <span className={classes}>
      {String(value)}
      <sub className="nwb__sub">{subMap[String(base)]}</sub>
    </span>
  );
};

export default NumberWithBase;

import React from 'react';

export type ResultLineProps = {
  label: string;
  value: string | number;
  baseSuffix?: string; // e.g., ₁₀, ₁₆, ₈
  ok?: boolean;
};

const ResultLine: React.FC<ResultLineProps> = ({
  label,
  value,
  baseSuffix,
  ok,
}) => {
  return (
    <div className="uh-result">
      <div className="uh-result-label">{label}</div>
      <div className={`uh-result-value ${ok ? 'ok' : ''}`}>
        {value}
        {baseSuffix && <span className="uh-base">{baseSuffix}</span>}
      </div>
    </div>
  );
};

export default ResultLine;

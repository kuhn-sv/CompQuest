import React from 'react';
import PlaceValueInputGrid from '../PlaceValueInputGrid/PlaceValueInputGrid';

export type Step1BoxProps = {
  base: 2 | 8;
  width: number;
  values: Array<number | null>;
  expected: number[];
  evaluated: boolean;
  onChange: (index: number, val: number | null) => void;
  decimalValue: number;
  isCorrect: boolean;
};

const Step1Box: React.FC<Step1BoxProps> = ({
  base,
  width,
  values,
  expected,
  evaluated,
  onChange,
  decimalValue,
  isCorrect,
}) => {
  return (
    <>
      <PlaceValueInputGrid
        base={base}
        width={width}
        values={values}
        expected={expected}
        evaluated={evaluated}
        onChange={onChange}
        labelBuilder={p => `1×${base}^{${p}} =`}
      />
      <div className="uh-result">
        <div className="uh-result-label">Dezimal:</div>
        <div className={`uh-result-value ${isCorrect ? 'ok' : ''}`}>
          {decimalValue}
          <span className="uh-base">₁₀</span>
        </div>
      </div>
    </>
  );
};

export default Step1Box;

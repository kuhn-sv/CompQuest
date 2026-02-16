import React from 'react';
import {SubTaskComponentProps} from '../interfaces';
import {useFixedFloatingPoint} from './useFixedFloatingPoint';
import {GameStartScreen} from '../../../../features/tasks/shared/components';
import TargetValueDisplay from '../../../../features/tasks/shared/components/target-value-display/TargetValueDisplay.component';
import {computeEvalStates} from '@shared/utils/evalStates';
import './FixedFloatingPoint.scss';
import { BitToggleRow } from '@/shared/components';

const FixedFloatingPointComponent: React.FC<SubTaskComponentProps> = (props) => {
  const {
    hasStarted,
    currentRound,
    bits,
    evaluated,
    isCorrect,
    handleStart,
    handleToggle,
    roundsCount,
    taskMeta
  } = useFixedFloatingPoint(props);

  if (!hasStarted) {
    return (
      <GameStartScreen
        statusTitle="Floating-Point Unit fehlkonfiguriert!"
        statusDescription={
          <>
            „Die Floating-Point Unit (FPU) ist fehlkonfiguriert! Der Rechner kann Dezimalzahlen nicht mehr richtig speichern und umrechnen. Programme, die mit Kommazahlen arbeiten, stürzen ab."
            <br /><br />
            <strong>Ziel der Reparatur:</strong> Wandle Dezimalzahlen zwischen Festkomma- und Gleitkommadarstellung um. Verstehe die IEEE-754-Notation und ordne Dezimalzahlen ihren binären Gleitkomma-Repräsentationen zu, damit der Computer wieder präzise rechnen kann.
          </>
        }
        taskCount={roundsCount}
        estimatedTime={taskMeta?.timeLimit ?? 0}
        fetchBestAttempt
        taskId={taskMeta?.id}
        onStart={handleStart}
        startLabel="Mission starten"
      />
    );
  }

  const isFloat = currentRound.mode === 'float';
  const formatLabel = isFloat ? 'Gleitkomma 1-4-3 / Bias 7' : 'Festkomma 4.4';

  const bitStates = computeEvalStates(bits, currentRound.expectedBits, evaluated);
  
  // Custom grouping logic for visual separators
  // We can pass a className or style to specific bits if BitToggleRow supported it per-bit,
  // or we can just use CSS selection if the structure is regular.
  // Ideally, BitToggleRow should support visual groups.
  // For now, let's wrap BitToggleRow and use CSS :nth-child or similar if possible, 
  // OR since BitToggleRow renders a simple grid, we might inject separators if we modify BitToggleRow (which I didn't plan to do heavily).
  // Alternative: The user plan mentioned "Toggle Row adaptation with separators".
  // Let's implement the separators visually via a background or overlay in SCSS, or by customizing the grid gap.
  
  return (
    <div className={`fixed-floating-point-container ${currentRound.mode}`}>
       <div className="ff-header">
         <h1>{taskMeta?.title}</h1>
       </div>

       <div className="ff-content">
          <TargetValueDisplay
             value={currentRound.targetValue.toString()}
             subLabel="Format"
             subValue={formatLabel}
             className="target-box"
          />

          <div className={`bits-frame ${evaluated ? (isCorrect ? 'success' : 'error') : ''} ${evaluated ? 'evaluated' : ''}`}>
             <div className="bits-wrapper">
                 <BitToggleRow
                    bits={bits}
                    onChange={handleToggle}
                    className={`bits-row ${isFloat ? 'float-layout' : 'fixed-layout'}`}
                    disabled={evaluated}
                    showPowers={!isFloat} // Only show powers for fixed point maybe? Or custom labels?
                    // Fixed Point 4.4: 2^3 ... 2^-4.
                    powerLabels={isFloat 
                        ? ['S', 'E3', 'E2', 'E1', 'E0', 'M2', 'M1', 'M0'] 
                        : ['2^3', '2^2', '2^1', '2^0', '2^-1', '2^-2', '2^-3', '2^-4']
                    }
                    bitStates={bitStates}
                 />
             </div>
          </div>
          
          {evaluated && (
            <div className="info-line">
              <span className={`expected ${isCorrect ? 'correct' : 'wrong'}`}>
                {isCorrect
                  ? '✓ richtig'
                  : `✗ erwartet: ${currentRound.expectedBits.join('')}`}
              </span>
            </div>
          )}
       </div>
    </div>
  );
};

export default FixedFloatingPointComponent;

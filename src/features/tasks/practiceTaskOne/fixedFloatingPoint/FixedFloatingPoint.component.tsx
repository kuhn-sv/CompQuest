import React from 'react';
import {SubTaskComponentProps} from '../interfaces';
import {useFixedFloatingPoint} from './useFixedFloatingPoint';
import {GameStartScreen} from '../../../../shared/components';
import TargetValueDisplay from '../../../../shared/components/TargetValueDisplay/TargetValueDisplay.component';
import BitToggleRow from '../../../../shared/components/bitToggleRow/BitToggleRow';
import './FixedFloatingPoint.scss';

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
        statusTitle="Rechenwerk"
        statusDescription={
          <>
            Die Recheneinheit des Systems weist kritische Verarbeitungsfehler auf. Durch eine Fehlkonfiguration werden Bitfolgen falsch interpretiert, was zu massiven Rundungsfehlern führt.
            <br /><br />
            <strong>Deine Mission:</strong> Repariere das Rechenwerk, indem du die Kalibrierungsprotokolle manuell ausführst. Wandle dazu jeden Dezimalwert präzise in das geforderte Bit-Muster für Fest- oder Gleitkomma um. Nur durch exakte Werte kann die Hardware wieder stabil werden.
          </>
        }
        taskCount={roundsCount}
        estimatedTime="~5 min"
        fetchBestAttempt
        taskId={taskMeta?.id}
        onStart={handleStart}
        startLabel="Mission starten"
      />
    );
  }

  const isFloat = currentRound.mode === 'float';
  const formatLabel = isFloat ? 'Gleitkomma 1-4-3 / Bias 7' : 'Festkomma 4.4';
  
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

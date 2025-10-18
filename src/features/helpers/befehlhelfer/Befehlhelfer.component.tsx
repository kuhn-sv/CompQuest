import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {SubTaskComponentProps} from '../../../shared/interfaces/tasking.interfaces';
import './Befehlhelfer.scss';
import OperationMatcher from './components/OperationMatcher';
import type {Operation} from './types';

// All 12 operations from the microprocessor instruction set
const ALL_OPERATIONS: Operation[] = [
  {
    id: 'nop',
    command: 'NOP',
    description: 'Wartezyklus (No Operation)',
  },
  {
    id: 'lda-immediate',
    command: 'LDA #n',
    description: 'Lädt den Akkumulator mit dem Wert n',
  },
  {
    id: 'lda-direct',
    command: 'LDA (n)',
    description: 'Lädt den Akkumulator mit dem Inhalt der Speicherstelle n',
  },
  {
    id: 'sta',
    command: 'STA n',
    description: 'Überträgt den Akkumulatorinhalt in die Speicherstelle n',
  },
  {
    id: 'add-immediate',
    command: 'ADD #n',
    description: 'Erhöht den Akkumulatorinhalt um den Wert n',
  },
  {
    id: 'add-direct',
    command: 'ADD (n)',
    description: 'Erhöht den Akkumulatorinhalt um den Inhalt der Speicherstelle n',
  },
  {
    id: 'sub-immediate',
    command: 'SUB #n',
    description: 'Erniedrigt den Akkumulatorinhalt um den Wert n',
  },
  {
    id: 'sub-direct',
    command: 'SUB (n)',
    description: 'Erniedrigt den Akkumulatorinhalt um den Inhalt der Speicherstelle n',
  },
  {
    id: 'jmp',
    command: 'JMP n',
    description: 'Lädt den Funktionszähler mit dem Wert n',
  },
  {
    id: 'bra',
    command: 'BRA #n',
    description: 'Addiert n auf den Instruktionszähler, falls das Zero-Bit gesetzt ist',
  },
  {
    id: 'brc',
    command: 'BRC #n',
    description: 'Addiert n auf den Instruktionszähler, falls das Carry-Bit gesetzt ist',
  },
  {
    id: 'brn',
    command: 'BRN #n',
    description: 'Addiert n auf den Instruktionszähler, falls das Negations-Bit gesetzt ist',
  },
];

const Befehlhelfer: React.FC<SubTaskComponentProps> = ({
  onControlsChange,
  onHudChange,
  onSummaryChange,
}) => {
  const [currentOperations, setCurrentOperations] = useState<Operation[]>([]);
  const [evaluated, setEvaluated] = useState(false);
  const initializedRef = useRef(false);

  // Shuffle array helper
  const shuffle = <T,>(array: T[]): T[] => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Generate new task: select 4 random operations and shuffle descriptions
  const newTask = useCallback(() => {
    setEvaluated(false);
    
    // Select 4 random operations
    const shuffled = shuffle(ALL_OPERATIONS);
    const selected = shuffled.slice(0, 4);
    
    // Shuffle the descriptions (right side) independently
    const descriptions = shuffle(selected.map(op => op.description));
    
    // Create new operations with shuffled descriptions but keep original IDs for matching
    const withShuffledDescriptions = selected.map((op, idx) => ({
      ...op,
      description: descriptions[idx],
    }));
    
    setCurrentOperations(withShuffledDescriptions);
  }, []);

  // Setup controls and HUD
  useEffect(() => {
    onHudChange?.({
      subtitle: 'Ordne Assembler-Begriffe ihren Beschreibungen zu',
      progress: null,
    });

    onControlsChange?.({
      onReset: () => newTask(),
      onEvaluate: () => setEvaluated(true),
      onNext: () => newTask(),
      showReset: true,
      showEvaluate: true,
      showNext: true,
      disableReset: false,
      disableEvaluate: false,
      disableNext: false,
    });

    return () => {
      onHudChange?.(null);
      onControlsChange?.(null);
      onSummaryChange?.(null);
    };
    // Only run once on mount to set up controls
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize first task
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      newTask();
      onHudChange?.({progress: null, requestTimer: 'reset'});
    }
    // Only run once on mount to initialize task
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="befehlhelfer">
      <div className="befehlhelfer__instructions">
        Verbinde die Assembler-Befehle auf der linken Seite mit der passenden
        Beschreibung auf der rechten Seite.
      </div>
      <OperationMatcher operations={currentOperations} evaluated={evaluated} />
    </div>
  );
};

export default Befehlhelfer;

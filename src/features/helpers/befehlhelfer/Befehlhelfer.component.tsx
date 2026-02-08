import React, {useCallback, useMemo, useState} from 'react';
import type {SubTaskComponentProps} from '../../../shared/interfaces/tasking.interfaces';
import './Befehlhelfer.scss';
import OperationMatcher from './components/OperationMatcher';
import type {Operation} from './types';
import {useHelperTask} from '../../../shared/hooks';

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
    description:
      'Erhöht den Akkumulatorinhalt um den Inhalt der Speicherstelle n',
  },
  {
    id: 'sub-immediate',
    command: 'SUB #n',
    description: 'Erniedrigt den Akkumulatorinhalt um den Wert n',
  },
  {
    id: 'sub-direct',
    command: 'SUB (n)',
    description:
      'Erniedrigt den Akkumulatorinhalt um den Inhalt der Speicherstelle n',
  },
  {
    id: 'jmp',
    command: 'JMP n',
    description: 'Lädt den Funktionszähler mit dem Wert n',
  },
  {
    id: 'brz',
    command: 'BRZ #n',
    description:
      'Addiert n auf den Instruktionszähler, falls das Zero-Bit gesetzt ist',
  },
  {
    id: 'brc',
    command: 'BRC #n',
    description:
      'Addiert n auf den Instruktionszähler, falls das Carry-Bit gesetzt ist',
  },
  {
    id: 'brn',
    command: 'BRN #n',
    description:
      'Addiert n auf den Instruktionszähler, falls das Negations-Bit gesetzt ist',
  },
];

const Befehlhelfer: React.FC<SubTaskComponentProps> = ({
  onControlsChange,
  onHudChange,
  onSummaryChange,
}) => {
  const [currentOperations, setCurrentOperations] = useState<Operation[]>([]);

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
  const generateTask = useCallback(() => {
    // Select 4 random operations
    const shuffled = shuffle(ALL_OPERATIONS);
    const selected = shuffled.slice(0, 4);

    // Create a mapping of description to original operation ID
    const descriptionMap = selected.map(op => ({
      description: op.description,
      originalId: op.id,
    }));

    // Shuffle the descriptions (right side) independently
    const shuffledDescriptions = shuffle(descriptionMap);

    // Create new operations with shuffled descriptions and track correct pairing
    const withShuffledDescriptions = selected.map((op, idx) => ({
      ...op,
      description: shuffledDescriptions[idx].description,
      correctDescriptionId: shuffledDescriptions[idx].originalId,
    }));

    setCurrentOperations(withShuffledDescriptions);
  }, []);

  const hudState = useMemo(
    () => ({
      subtitle: 'Ordne Assembler-Begriffe ihren Beschreibungen zu',
      progress: null,
    }),
    [],
  );

  const {evaluated} = useHelperTask({
    onControlsChange,
    onHudChange,
    onSummaryChange,
    generateTask,
    hudState,
  });

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

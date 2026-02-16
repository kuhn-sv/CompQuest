import React, {useCallback} from 'react';
import type {SubTaskComponentProps} from '../interfaces';
import GenericArithmeticTask from './GenericArithmeticTask';
import {generateAdditionSet} from './addition.helper';
import {Difficulty} from '@shared/enums/difficulty.enum';
import {TaskId} from '@shared/enums/taskId.enum';

const PositiveArithmeticTask: React.FC<SubTaskComponentProps> = (props) => {
  const generateTasks = useCallback(
    (difficulty: Difficulty) => generateAdditionSet(difficulty, 'positive'),
    [],
  );

  return (
    <GenericArithmeticTask
      {...props}
      title="Positive Arithmetik – Übung 1.2"
      subtitle="Positive Additionen und Subtraktionen (3 Stufen)"
      generateTasks={generateTasks}
      arithmeticMode="positive"
      startScreen={{
        title: 'Additions-Schaltkreis beschädigt!',
        description: (
          <>
            „Der Additions-Schaltkreis hat einen Fehler! Der Rechner kann zwar Zahlen erkennen, aber nicht mehr in verschiedenen Zahlensystemen addieren. Die Rechenoperationen liefern falsche Ergebnisse."
            <br /><br />
            <strong>Ziel der Reparatur:</strong> Führe Additionen in binär, oktal und hexadezimal korrekt durch. Zeige dem System, wie man in unterschiedlichen Zahlensystemen rechnet, damit die Recheneinheit wieder zuverlässig arbeitet.
          </>
        ),
        taskId: TaskId.PositiveArithmetic,
      }}
    />
  );
};

export default PositiveArithmeticTask;

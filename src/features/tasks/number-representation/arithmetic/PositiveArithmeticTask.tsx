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
        title: 'Rechenmodul offline!',
        description: (
          <>
            Der zentrale Rechenkern ist abgestürzt, weil Zahlen
            unterschiedlicher Systeme nicht mehr korrekt miteinander
            interagieren.
            <strong>Deine Mission: </strong>Führe die Grundrechenoperationen
            in Binär-, Oktal- und Hexadezimaldarstellung korrekt durch,
            indem du jeder Rechnung das passende Gegenstück zuordnest.
            Stelle sicher, dass alle Zahlensysteme wieder synchron rechnen –
            nur dann kann der Rechenkern neu starten.
          </>
        ),
        taskId: TaskId.PositiveArithmetic,
      }}
    />
  );
};

export default PositiveArithmeticTask;

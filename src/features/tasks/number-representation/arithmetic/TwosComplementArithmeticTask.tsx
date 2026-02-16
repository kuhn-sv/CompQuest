import React, {useCallback} from 'react';
import type {SubTaskComponentProps} from '../interfaces';
import GenericArithmeticTask from './GenericArithmeticTask';
import {generateAdditionSet} from './addition.helper';
import {Difficulty} from '@shared/enums/difficulty.enum';
import {TaskId} from '@shared/enums/taskId.enum';

const TwosComplementArithmeticTask: React.FC<SubTaskComponentProps> = (props) => {
  const generateTasks = useCallback(
    (difficulty: Difficulty) => generateAdditionSet(difficulty, 'twos-complement'),
    [],
  );

  return (
    <GenericArithmeticTask
      {...props}
      title="Zweierkomplement-Arithmetik – Übung 1.2"
      subtitle="Additionen im Zweierkomplement (3 Stufen)"
      generateTasks={generateTasks}
      arithmeticMode="twos-complement"
      startScreen={{
        title: 'ALU streikt!',
        description: (
          <>
            „Die ALU (Arithmetic Logic Unit) streikt! Sie kann zwar positive Zahlen verarbeiten, aber sobald negative Zahlen ins Spiel kommen, produziert sie Datenmüll. Berechnungen mit Vorzeichen funktionieren nicht mehr."
            <br /><br />
            <strong>Ziel der Reparatur:</strong> Wende das Zweierkomplement in Rechenoperationen an. Führe Additionen und Subtraktionen mit negativen Zahlen durch und verstehe, wie Overflow und Vorzeichenoperationen funktionieren, um die ALU zu kalibrieren.
          </>
        ),
        taskId: TaskId.TwosComplementArithmetic,
      }}
    />
  );
};

export default TwosComplementArithmeticTask;

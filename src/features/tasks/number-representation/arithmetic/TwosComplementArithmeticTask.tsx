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
        title: 'Rechenfehler erkannt!',
        description: (
          <>
            Beim Addieren negativer Zahlen im Zweierkomplement wurde der
            Datenfluss gesprengt. Der Prozessor kann nicht mehr korrekt mit
            negativen Zahlen umgehen.
            <strong>Deine Mission: </strong> Verbinde zusammengehörige
            Operationen im Zweierkomplement präzise und erkenne, wann ein
            Überlauf entsteht. So stellst du sicher, dass der Datenfluss
            wiederhergestellt wird und der Prozessor fehlerfrei rechnen
            kann.
          </>
        ),
        taskId: TaskId.TwosComplementArithmetic,
      }}
    />
  );
};

export default TwosComplementArithmeticTask;

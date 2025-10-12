import React, {useMemo, useState} from 'react';
import {SubTaskConfig, SubTaskComponentProps} from './interfaces';
import NumberSystemComponent from './number-system/NumberSystem.component';
import PositiveArithmeticComponent from './arithmetic/arithmetic';
import ComplementsComponent from './complements/Complements.component';
import Quiz from './quiz/Quiz.component';
import {TaskContainer} from '../../../shared/components';
import {TaskId} from '../../../shared/enums/taskId.enum';

interface PracticeTaskOnePageProps {
  initialSubTask?: TaskId;
}

// Stable wrapper to inject arithmeticMode without recreating component identity on each render
const TwosComplementArithmeticSubtask: React.FC<
  SubTaskComponentProps
> = props => (
  <PositiveArithmeticComponent {...props} arithmeticMode="twos-complement" />
);

const PracticeTaskOne: React.FC<PracticeTaskOnePageProps> = ({
  initialSubTask = TaskId.NumberSystem,
}) => {
  const [currentSubTask] = useState<TaskId>(initialSubTask);

  // Configuration for all subtasks
  const subTaskConfigs: SubTaskConfig[] = [
    {
      id: TaskId.NumberSystem,
      title: 'Zahlensystem-Konverter',
      description: 'Verbinde jede Zahl mit ihrem passenden Gegenstück rechts.',
      chapters: [{title: '3.1 Zahlensysteme'}],
      component:
        NumberSystemComponent as React.ComponentType<SubTaskComponentProps>,
      timeLimit: 5 * 60 * 1000,
    },
    {
      id: TaskId.PositiveArithmetic,
      title: 'Positive Arithmetik',
      description: 'Additionen und Subtraktionen mit positiven Zahlen.',
      chapters: [{title: '3.1 Zahlensysteme'}],
      component:
        PositiveArithmeticComponent as React.ComponentType<SubTaskComponentProps>,
      timeLimit: 5 * 60 * 1000,
    },
    {
      id: TaskId.Complements,
      title: 'Einer- & Zweierkomplement',
      description:
        'Verbinde Binärzahlen mit ihren Dezimalwerten und übe Einer-/Zweierkomplement.',
      chapters: [{title: '3.2.1 Darstellung natürlicher Zahlen'}],
      component:
        ComplementsComponent as React.ComponentType<SubTaskComponentProps>,
      timeLimit: 5 * 60 * 1000,
    },
    {
      id: TaskId.TwosComplementArithmetic,
      title: 'Zweierkomplement-Arithmetik',
      description:
        'Additionen im Zweierkomplement mit fester Bitbreite (nur binär).',
      chapters: [{title: '3.2.1 Darstellung natürlicher Zahlen'}],
      component:
        TwosComplementArithmeticSubtask as React.ComponentType<SubTaskComponentProps>,
      timeLimit: 5 * 60 * 1000,
    },
    {
      id: TaskId.Quiz,
      title: 'Quiz',
      description: 'Beweise dein Wissen. ',
      component: Quiz as React.ComponentType<SubTaskComponentProps>,
      timeLimit: 5 * 60 * 1000,
    },
  ];

  const currentTaskIndex = subTaskConfigs.findIndex(
    task => task.id === currentSubTask,
  );
  const currentTask = subTaskConfigs[currentTaskIndex];
  const taskMeta = useMemo(
    () => ({
      id: currentTask?.id ?? '',
      title: currentTask?.title ?? '',
      chapters: currentTask?.chapters ?? [],
      timeLimit: currentTask?.timeLimit ?? 0,
    }),
    [
      currentTask?.id,
      currentTask?.title,
      currentTask?.chapters,
      currentTask?.timeLimit,
    ],
  );

  const CurrentTaskComponent = currentTask?.component;

  return (
    <TaskContainer
      taskMeta={taskMeta}
      title={currentTask?.title ?? ''}
      description={currentTask?.description}>
      {({onControlsChange, onHudChange, onSummaryChange}) => (
        <>
          {CurrentTaskComponent && (
            <CurrentTaskComponent
              taskMeta={taskMeta}
              onControlsChange={onControlsChange}
              onHudChange={onHudChange}
              onSummaryChange={onSummaryChange}
            />
          )}
        </>
      )}
    </TaskContainer>
  );
};

export default PracticeTaskOne;

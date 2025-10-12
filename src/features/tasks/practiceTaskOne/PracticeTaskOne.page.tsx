import React, {useMemo, useState} from 'react';
import {SubTaskType, SubTaskConfig, SubTaskComponentProps} from './interfaces';
import NumberSystemComponent from './number-system/NumberSystem.component';
import PositiveArithmeticComponent from './positive-arithmetic/PositiveArithmetic.component';
import ComplementsComponent from './complements/Complements.component';
import Quiz from './quiz/Quiz.component';
import {TaskContainer} from '../../../shared/components';

interface PracticeTaskOnePageProps {
  initialSubTask?: SubTaskType;
}

// Stable wrapper to inject arithmeticMode without recreating component identity on each render
const TwosComplementArithmeticSubtask: React.FC<
  SubTaskComponentProps
> = props => (
  <PositiveArithmeticComponent {...props} arithmeticMode="twos-complement" />
);

const PracticeTaskOne: React.FC<PracticeTaskOnePageProps> = ({
  initialSubTask = 'number-system',
}) => {
  const [currentSubTask] = useState<SubTaskType>(initialSubTask);

  // Configuration for all subtasks
  const subTaskConfigs: SubTaskConfig[] = [
    {
      id: 'number-system',
      title: 'Zahlensystem-Konverter',
      description:
        'Konvertierung zwischen binär ↔ oktal ↔ dezimal ↔ hexadezimal.',
      component:
        NumberSystemComponent as React.ComponentType<SubTaskComponentProps>,
    },
    {
      id: 'positive-arithmetic',
      title: 'Positive Arithmetik',
      description:
        'Additionen von positiven Zahlen in binär, oktal und hexadezimal.',
      component:
        PositiveArithmeticComponent as React.ComponentType<SubTaskComponentProps>,
    },
    {
      id: 'complements',
      title: 'Einer- & Zweierkomplement',
      description: 'Erzeuge das Einer-/ Zweierkomplement einer binären Zahl.',
      component:
        ComplementsComponent as React.ComponentType<SubTaskComponentProps>,
    },
    {
      id: 'twos-complement',
      title: 'Zweierkomplement-Arithmetik',
      description: 'Führe die Subtraktion im Addierwerk durch.',
      component:
        TwosComplementArithmeticSubtask as React.ComponentType<SubTaskComponentProps>,
    },
    {
      id: 'quiz',
      title: 'Quiz',
      description: 'Beantworte Tims Fragen zum Thema Zahlendarstellung.',
      component: Quiz as React.ComponentType<SubTaskComponentProps>,
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
    }),
    [currentTask?.id, currentTask?.title],
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

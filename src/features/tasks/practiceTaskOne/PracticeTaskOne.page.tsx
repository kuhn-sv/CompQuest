import React, {useState} from 'react';
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
      description: 'Verbinde jede Zahl mit ihrem passenden Gegenstück rechts.',
      component:
        NumberSystemComponent as React.ComponentType<SubTaskComponentProps>,
    },
    {
      id: 'positive-arithmetic',
      title: 'Positive Arithmetik',
      description: 'Additionen und Subtraktionen mit positiven Zahlen.',
      component:
        PositiveArithmeticComponent as React.ComponentType<SubTaskComponentProps>,
    },
    {
      id: 'complements',
      title: 'Einer- & Zweierkomplement',
      description:
        'Verbinde Binärzahlen mit ihren Dezimalwerten und übe Einer-/Zweierkomplement.',
      component:
        ComplementsComponent as React.ComponentType<SubTaskComponentProps>,
    },
    {
      id: 'twos-complement',
      title: 'Zweierkomplement-Arithmetik',
      description:
        'Additionen im Zweierkomplement mit fester Bitbreite (nur binär).',
      component:
        TwosComplementArithmeticSubtask as React.ComponentType<SubTaskComponentProps>,
    },
    {
      id: 'quiz',
      title: 'Quiz',
      description: 'Beweise dein Wissen. ',
      component: Quiz as React.ComponentType<SubTaskComponentProps>,
    },
  ];

  const currentTaskIndex = subTaskConfigs.findIndex(
    task => task.id === currentSubTask,
  );
  const currentTask = subTaskConfigs[currentTaskIndex];

  const CurrentTaskComponent = currentTask?.component;
  return (
    <TaskContainer
      title={currentTask?.title ?? ''}
      description={currentTask?.description}>
      {({onControlsChange, onHudChange, onSummaryChange}) => (
        <>
          {CurrentTaskComponent && (
            <CurrentTaskComponent
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

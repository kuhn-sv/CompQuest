import React, { useState } from 'react';
import { 
  SubTaskType, 
  SubTaskConfig, 
  SubTaskComponentProps
} from './interfaces';
import NumberSystemComponent from './number-system/NumberSystem.component';
import PositiveArithmeticComponent from './positive-arithmetic/PositiveArithmetic.component';
// TODO: Import other subtasks when they're available
// import DataPackagePage from '../dataPackage/DataPackage.page';
// import TwosComplementPage from '../twosComplement/TwosComplement.page';
import './PracticeTaskOne.page.scss';

interface PracticeTaskOnePageProps {
  initialSubTask?: SubTaskType;
}

const PracticeTaskOne: React.FC<PracticeTaskOnePageProps> = ({
  initialSubTask = 'number-system'
}) => {
  const [currentSubTask] = useState<SubTaskType>(initialSubTask);

  // Configuration for all subtasks
  const subTaskConfigs: SubTaskConfig[] = [
    {
      id: 'number-system',
      title: 'Zahlensystem-Konverter',
      description: 'Verbinde jede Zahl mit ihrem passenden Gegenstück rechts.',
      component: NumberSystemComponent as React.ComponentType<SubTaskComponentProps>
    },
    {
      id: 'positive-arithmetic',
      title: 'Positive Arithmetik',
      description: 'Additionen und Subtraktionen mit positiven Zahlen.',
      component: PositiveArithmeticComponent as React.ComponentType<SubTaskComponentProps>
    },
    // TODO: Add other subtasks when available
    // {
    //   id: 'data-package',
    //   title: 'Datenfluss wiederherstellen',
    //   description: 'Stelle den Datenfluss wieder her.',
    //   component: DataPackagePage as React.ComponentType<SubTaskComponentProps>
    // },
    // {
    //   id: 'twos-complement',
    //   title: 'Zweierkomplement',
    //   description: 'Arbeite mit Zweierkomplementdarstellung.',
    //   component: TwosComplementPage as React.ComponentType<SubTaskComponentProps>
    // }
  ];

  const currentTaskIndex = subTaskConfigs.findIndex(task => task.id === currentSubTask);
  const currentTask = subTaskConfigs[currentTaskIndex];

  const CurrentTaskComponent = currentTask?.component;

  return (
    <div className="practice-task-one-page">
      <div className="practice-task-one-page__container">
        {/* Header */}
        <div className="practice-task-one-page__header">
          <div className="task-info">
            <h2 className="task-title">{currentTask?.title}</h2>
            <p className="task-description">{currentTask?.description}</p>
          </div>
        </div>

        {/* Task Content */}
        <div className="practice-task-one-page__task-content">
          {CurrentTaskComponent && (
            <CurrentTaskComponent />
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeTaskOne;

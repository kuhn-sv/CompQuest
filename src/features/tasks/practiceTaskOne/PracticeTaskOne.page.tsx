import React, { useEffect, useState } from 'react';
import { 
  SubTaskType, 
  SubTaskConfig, 
  SubTaskComponentProps,
  TaskFooterControls,
  TaskHudState
} from './interfaces';
import NumberSystemComponent from './number-system/NumberSystem.component';
import PositiveArithmeticComponent from './positive-arithmetic/PositiveArithmetic.component';
import ComplementsComponent from './complements/Complements.component';
// TODO: Import other subtasks when they're available
// import DataPackagePage from '../dataPackage/DataPackage.page';
// import TwosComplementPage from '../twosComplement/TwosComplement.page';
import './PracticeTaskOne.page.scss';
import TaskActionButtons from '../../../shared/components/TaskActionButtons/TaskActionButtons.component';
import { Timer } from '../../../shared/components';
import { useTimer } from '../../../shared/hooks';

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
    {
      id: 'complements',
      title: 'Einer- & Zweierkomplement',
      description: 'Verbinde Binärzahlen mit ihren Dezimalwerten und übe Einer-/Zweierkomplement.',
      component: ComplementsComponent as React.ComponentType<SubTaskComponentProps>
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

  // Footer controls provided by child subtask
  const [footerControls, setFooterControls] = useState<TaskFooterControls | null>(null);
  const [hudState, setHudState] = useState<TaskHudState | null>(null);
  const { time, isRunning, start, stop, reset, formatTime, getElapsed } = useTimer();
  // Reset footer controls when task changes
  useEffect(() => {
    setFooterControls(null);
    setHudState(null);
  }, [currentTaskIndex]);

  return (
    <div className="practice-task-one-page">
      <div className="practice-task-one-page__container">
        {/* Header */}
        <div className="practice-task-one-page__header">
          <div className="header-row header-row--top">
            <div className="task-info">
              <h2 className="task-title">{currentTask?.title}</h2>
              <p className="task-description">{hudState?.subtitle ?? currentTask?.description}</p>
            </div>
            <div className="task-hud">
              <Timer 
                time={time}
                isRunning={isRunning}
                formatTime={formatTime}
                getElapsed={getElapsed}
              />
            </div>
          </div>
          <div className="header-row header-row--bottom">
            <div className="task-progress__meta">
              <span className="task-progress__label">
                {hudState?.progress ? `Aufgabe ${hudState.progress.current}/${hudState.progress.total}` : ''}
              </span>
              <span className="task-progress__percent">
                {hudState?.progress ? `${Math.round((hudState.progress.current / hudState.progress.total) * 100)}%` : ''}
              </span>
            </div>
            <div className="task-progress__bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={hudState?.progress ? Math.round((hudState.progress.current / hudState.progress.total) * 100) : 0}>
              <div
                className="task-progress__fill"
                style={{ width: hudState?.progress ? `${(hudState.progress.current / hudState.progress.total) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>

        {/* Task Content */}
        <div className="practice-task-one-page__task-content">
          {CurrentTaskComponent && (
            <CurrentTaskComponent 
              onControlsChange={setFooterControls}
              onHudChange={(hud) => {
                setHudState(hud);
                if (!hud) return;
                if (hud.requestTimer === 'start') start();
                if (hud.requestTimer === 'stop') stop();
                if (hud.requestTimer === 'reset') reset();
              }}
            />
          )}
        </div>

        {/* Unified footer with task action buttons */}
        <div className="practice-task-one-page__footer">
          {footerControls && (
            <TaskActionButtons
              onReset={footerControls.onReset}
              onEvaluate={footerControls.onEvaluate}
              onNext={footerControls.onNext}
              showReset={footerControls.showReset}
              showEvaluate={footerControls.showEvaluate}
              showNext={footerControls.showNext}
              disableReset={footerControls.disableReset}
              disableEvaluate={footerControls.disableEvaluate}
              disableNext={footerControls.disableNext}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeTaskOne;

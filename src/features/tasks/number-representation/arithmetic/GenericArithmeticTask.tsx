import React, {useMemo, useRef, useCallback, useEffect} from 'react';
import {Link} from 'react-router-dom';
import '../number-system/number-system.page.scss';

// Footer buttons are rendered in parent; we expose controls upwards
import {
  useConnectionLines,
  useFooterControls,
  useHudState,
  useGameStartScreen,
  CONNECTION_LINE_PRESETS,
} from '@shared/hooks';
import NumberWithBase from '@shared/components/input/number/NumberWithBase.component';
import {AdditionSet, AdditionTask} from './addition.helper';
import {Difficulty} from '@shared/enums/difficulty.enum';
import type {ArithmeticMode, SubTaskComponentProps} from '../interfaces';
import {DragOverlay} from '@dnd-kit/core';
import {AnswerOptionBase} from '../shared/number-task/NumberTask.types';
import {ResultsSection} from '../shared/number-task/ResultsSection';
import DndProvider from '@shared/utils/dnd/DndProvider';
import {ConnectionOverlay} from '@features/tasks/shared/components/connection-overlay';
import { EquationRow } from '@/shared/components';
import {useArithmeticTaskLogic} from './hooks/useArithmeticTaskLogic';
import {useArithmeticDnD} from './hooks/useArithmeticDnD';
import { TaskContext } from '@/shared/interfaces/tasking.interfaces';
import { GameStartScreen } from '../../shared/components';

export interface GenericArithmeticTaskProps extends SubTaskComponentProps {
  // Title displayed in the header
  title: string;
  // Subtitle displayed in the HUD
  subtitle: string;
  // Function to generate tasks for a given difficulty
  generateTasks: (difficulty: Difficulty) => AdditionSet;
  // Mode identifier for styling or minor logic branches
  arithmeticMode: ArithmeticMode;
  // Configuration for the start screen
  startScreen: {
    title: string;
    description: React.ReactNode;
    taskId: import('@shared/enums/taskId.enum').TaskId;
  };
}

const GenericArithmeticTask: React.FC<GenericArithmeticTaskProps> = ({
  onControlsChange,
  onSummaryChange,
  onHudChange,
  onTaskContextChange,
  taskMeta,
  getElapsed,
  title,
  subtitle,
  generateTasks,
  arithmeticMode,
  startScreen,
}) => {
  const {
    stageIndex,
    stages,
    tasks,
    answerPool,
    assignments,
    activeTaskId,
    evaluated,
    setActiveTaskId,
    handleInitialStart,
    resetSet,
    assignAnswer,
    evaluate,
    goToNextStage,
    usedAnswerKeys,
  } = useArithmeticTaskLogic({
    generateTasks,
    getElapsed,
    onSummaryChange,
    onHudChange,
  });

  const {
    dndDraggedAnswer,
    dndDragOverTaskId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    resetDnDState,
  } = useArithmeticDnD({assignAnswer});

  const containerRef = useRef<HTMLDivElement>(
    null,
  ) as React.RefObject<HTMLDivElement>;

  // Start-screen lifecycle
  const {hasStarted, startTask} = useGameStartScreen({
    onHudChange,
    totalTasks: stages.length,
    subtitle: subtitle,
  });

  // Handle actual start logic combining both hooks
  const onStart = useCallback(() => {
    startTask();
    handleInitialStart();
  }, [startTask, handleInitialStart]);

  const onReset = useCallback(() => {
    resetSet();
    resetDnDState();
  }, [resetSet, resetDnDState]);

  // Connection lines calculation
  const getTaskIdCb = useCallback((task: AdditionTask) => task.id, []);
  const compareAnswersCb = useCallback(
    (assignment: AnswerOptionBase, poolAnswer: AnswerOptionBase) =>
      assignment.value === poolAnswer.value &&
      assignment.base === poolAnswer.base,
    [],
  );
  const evaluateStatusCb = useCallback(
    (task: AdditionTask, assignment: AnswerOptionBase) => {
      const aBase =
        typeof assignment.base === 'string'
          ? parseInt(assignment.base, 10)
          : assignment.base;
      if (assignment.value === task.expected && aBase === task.base)
        return 'correct';
      return 'wrong';
    },
    [],
  );

  const connectionLines = useConnectionLines({
    tasks,
    assignments,
    answerPool,
    containerRef,
    getTaskId: getTaskIdCb,
    compareAnswers: compareAnswersCb,
    ...CONNECTION_LINE_PRESETS.NUMBER_SYSTEM,
    debug: false,
    evaluated,
    evaluateStatus: evaluateStatusCb,
  });

  // Provide compact context for AskTim
  useEffect(() => {
    if (!onTaskContextChange) return;
    if (!hasStarted) {
      onTaskContextChange(null);
      return;
    }
    
    // Extract description text if it's react node we can't fully serialize it, 
    // so we use a fallback or try to get string representation if possible.
    // Since startScreen.description is ReactNode, we use a generic description here for the context.
    const description = arithmeticMode === 'twos-complement' 
        ? 'Berechne die Ergebnisse im Zweierkomplement.' 
        : 'Addiere die Zahlen in den angegebenen Basen.';

    const taskContext: TaskContext = {
      subtaskType: arithmeticMode === 'twos-complement' ? 'TwosComplementArithmetic' : 'PositiveArithmetic',
      taskId: activeTaskId || taskMeta?.id || 'Arithmetic',
      taskTitle: taskMeta?.title ?? title,
      description: description,
      contextData: {
          stage: stageIndex + 1,
          totalStages: stages.length,
          tasks: tasks.map(t => ({
              id: t.id,
              equation: t.left,
              base: t.base
          })),
      },
      userState: {
           assignments: Object.entries(assignments).map(([taskId, assign]) => ({
              taskId,
              assignedValue: assign?.value,
              assignedBase: assign?.base
          }))
      },
      solution: {
          correctAssignments: tasks.map(t => ({
              taskId: t.id,
              expectedValue: t.expected,
              expectedBase: t.base
          }))
      }
    };
    onTaskContextChange(taskContext);
    return () => onTaskContextChange(null);
  }, [
    onTaskContextChange,
    hasStarted,
    stageIndex,
    tasks,
    taskMeta,
    title,
    stages.length,
    activeTaskId,
    assignments,
    arithmeticMode
  ]);

  // Provide footer controls to parent (stabilised via hook)
  // Note: onHudChangeRef is handled inside useArithmeticTaskLogic effectively for progress updates
  // but we still need to pass controls
  useFooterControls(
    onControlsChange,
    {onReset, onEvaluate: evaluate, onNext: goToNextStage},
    {
      showReset: true,
      showEvaluate: !evaluated,
      showNext: evaluated && stageIndex < stages.length - 1,
      disableReset: evaluated || !tasks.length,
      disableNext: false,
    },
    hasStarted && tasks.length > 0,
  );

  // HUD state (stabilised via hook)
  // useArithmeticTaskLogic handles progress updates via onHudChangeRef,
  // but we also need to set the initial subtitle/state here
  const hudState = useMemo(() => {
    if (!hasStarted) return {progress: null, isStartScreen: true} as const;
    return {
      progress: {current: stageIndex + 1, total: stages.length},
      subtitle: subtitle,
    };
  }, [hasStarted, stageIndex, stages.length, subtitle]);
  useHudState(onHudChange, hudState);

  return (
    <div className="number-system-container">
      <div className="ns-header">
        <Link to="/dashboard" className="back-to-dashboard">
          ← Zurück zum Dashboard
        </Link>
        <h1>{title}</h1>
      </div>

      {hasStarted && tasks.length > 0 && (
        <DndProvider
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}>
          <div
            className={`ns-content ${activeTaskId ? 'has-active' : ''}`}
            ref={containerRef}>
            <div className="equations-and-results">
              <div className="equations-section">
                {tasks.map(t => {
                  const assigned = assignments[t.id];
                  const assignedBase =
                    typeof assigned?.base === 'string'
                      ? parseInt(assigned.base, 10)
                      : assigned?.base;
                  const isCorrect =
                    evaluated &&
                    !!assigned &&
                    assigned.value === t.expected &&
                    assignedBase === t.base;
                  const isWrong =
                    evaluated &&
                    !!assigned &&
                    !(assigned.value === t.expected && assignedBase === t.base);
                  const isActive = activeTaskId === t.id;
                  const [zahl1, zahl2] = t.left.split(' + ');
                  const baseSub =
                    t.base === 2
                      ? '₂'
                      : t.base === 8
                        ? '₈'
                        : t.base === 16
                          ? '₁₆'
                          : '';
                  return (
                    <EquationRow
                      key={`pa-task:${t.id}`}
                      hasAssignment={!!assigned}
                      sourceContent={
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            lineHeight: 1.2,
                          }}>
                          <span>
                            {zahl1}
                            <sub style={{marginLeft: 2}}>{baseSub}</sub>
                          </span>
                          <span>
                            + {zahl2}
                            <sub style={{marginLeft: 2}}>{baseSub}</sub>
                          </span>
                        </div>
                      }
                      assignedContent={
                        assigned && assignedBase ? (
                          <NumberWithBase
                            value={assigned.value}
                            base={assignedBase as 2 | 8 | 10 | 16}
                          />
                        ) : null
                      }
                      isCorrect={isCorrect}
                      isWrong={isWrong}
                      isActive={isActive}
                      isDragOver={dndDragOverTaskId === t.id}
                      onClick={() => setActiveTaskId(t.id)}
                      enableDndKit={true}
                      droppableId={`task:${t.id}`}
                    />
                  );
                })}
              </div>
              <ResultsSection
                answerPool={answerPool}
                usedAnswerKeys={usedAnswerKeys}
                assignments={assignments}
                draggedAnswer={dndDraggedAnswer}
                activeTaskId={activeTaskId}
                tasks={tasks}
                assignAnswer={assignAnswer}
                evaluated={evaluated}
                keyPrefix={
                  arithmeticMode === 'twos-complement' ? 'tc-pa' : 'pa'
                }
                renderAnswer={(a: AnswerOptionBase) =>
                  typeof a.base === 'number' ? (
                    <NumberWithBase
                      value={a.value}
                      base={a.base as 2 | 8 | 10 | 16}
                    />
                  ) : (
                    a.value
                  )
                }
                enableDndKit={true}
              />
            </div>
            <ConnectionOverlay connectionLines={connectionLines} />
            <DragOverlay>
              {dndDraggedAnswer ? (
                typeof dndDraggedAnswer.base === 'number' ? (
                  <div className="ns-drag-overlay">
                    <NumberWithBase
                      value={dndDraggedAnswer.value}
                      base={dndDraggedAnswer.base as 2 | 8 | 10 | 16}
                    />
                  </div>
                ) : (
                  <div className="ns-drag-overlay">
                    {dndDraggedAnswer.value}
                  </div>
                )
              ) : null}
            </DragOverlay>
            {/* Controls moved to parent footer */}
          </div>
        </DndProvider>
      )}

      {!hasStarted && (
        <GameStartScreen
          statusTitle={startScreen.title}
          statusDescription={startScreen.description}
          taskCount={4}
          estimatedTime={taskMeta?.timeLimit ?? 0}
          fetchBestAttempt
          taskId={startScreen.taskId}
          onStart={onStart}
          startLabel="Mission starten"
        />
      )}
    </div>
  );
};

export default GenericArithmeticTask;

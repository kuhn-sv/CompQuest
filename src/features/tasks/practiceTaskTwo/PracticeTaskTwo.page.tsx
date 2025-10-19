import React, {useMemo, useState} from 'react';
import {TaskContainer} from '../../../shared/components';
import {TaskId} from '../../../shared/enums/taskId.enum';
import type {SubTaskConfig, SubTaskComponentProps} from '../../../shared/interfaces/tasking.interfaces';
import {VonNeumann, ReadAssembly, WriteAssembly, JavaToAssembly} from './components';

interface PracticeTaskTwoPageProps {
  initialSubTask?: TaskId;
}

const PracticeTaskTwo: React.FC<PracticeTaskTwoPageProps> = ({
  initialSubTask = TaskId.VonNeumann,
}) => {
  const [currentSubTask] = useState<TaskId>(initialSubTask);

  // Configuration for all subtasks
  const subTaskConfigs: SubTaskConfig[] = [
    {
      id: TaskId.VonNeumann,
      title: 'Von‑Neumann‑Architektur',
      description:
        'Wähle die zentralen Komponenten der Von‑Neumann‑Architektur.',
      component: VonNeumann as React.ComponentType<SubTaskComponentProps>,
      chapters: [],
      timeLimit: 8 * 60 * 1000,
    },
    {
      id: TaskId.ReadAssembly,
      title: 'Assembler‑Programm lesen',
      description:
        'Lies den Assembler-Code und beantworte die Fragen korrekt.',
      component: ReadAssembly as React.ComponentType<SubTaskComponentProps>,
      chapters: [],
      timeLimit: 8 * 60 * 1000,
    },
    {
      id: TaskId.WriteAssembly,
      title: 'Assembler‑Programm schreiben',
      description:
        'Sortiere die Befehle in die richtige Reihenfolge.',
      component: WriteAssembly as React.ComponentType<SubTaskComponentProps>,
      chapters: [],
      timeLimit: 8 * 60 * 1000,
    },
    {
      id: TaskId.JavaToAssembly,
      title: 'Java → Assembler',
      description:
        'Ordne die Befehle richtig an, um den Java Code in Assembler zu übersetzen.',
      component: JavaToAssembly as React.ComponentType<SubTaskComponentProps>,
      chapters: [],
      timeLimit: 8 * 60 * 1000,
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
      {({onControlsChange, onHudChange, onSummaryChange, onTaskContextChange}) => (
        <>
          {CurrentTaskComponent && (
            <CurrentTaskComponent
              taskMeta={taskMeta}
              onControlsChange={onControlsChange}
              onHudChange={onHudChange}
              onSummaryChange={onSummaryChange}
              onTaskContextChange={onTaskContextChange}
            />
          )}
        </>
      )}
    </TaskContainer>
  );
};

export default PracticeTaskTwo;

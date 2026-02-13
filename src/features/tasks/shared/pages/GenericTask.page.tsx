import React, {useMemo, useState} from 'react';
import {SubTaskConfig} from '@shared/interfaces/tasking.interfaces';
import {TaskId} from '@shared/enums/taskId.enum';
import TaskContainer from '../components/task-container/TaskContainer.component';

export interface GenericTaskPageProps {
  initialSubTask?: TaskId;
  subTaskConfigs: SubTaskConfig[];
}

const GenericTaskPage: React.FC<GenericTaskPageProps> = ({
  initialSubTask,
  subTaskConfigs,
}) => {
  const [currentSubTask] = useState<TaskId>(
    (initialSubTask ?? subTaskConfigs[0].id) as TaskId,
  );

  const currentTaskIndex = subTaskConfigs.findIndex(
    task => task.id === currentSubTask,
  );
  
  // Fallback to first task if currentSubTask is not found (robustness)
  const taskIndexToUse = currentTaskIndex !== -1 ? currentTaskIndex : 0;
  const currentTask = subTaskConfigs[taskIndexToUse];
  
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
      {({
        onControlsChange,
        onHudChange,
        onSummaryChange,
        onTaskContextChange,
        getElapsed,
      }) => (
        <>
          {CurrentTaskComponent && (
            <CurrentTaskComponent
              taskMeta={taskMeta}
              onControlsChange={onControlsChange}
              onHudChange={onHudChange}
              onSummaryChange={onSummaryChange}
              onTaskContextChange={onTaskContextChange}
              getElapsed={getElapsed}
            />
          )}
        </>
      )}
    </TaskContainer>
  );
};

export default GenericTaskPage;

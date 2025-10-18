import { TaskId } from '../../../../shared/enums/taskId.enum';
import type { SubTaskComponentProps, SubTaskConfig as BaseSubTaskConfig } from '../../../../shared/interfaces/tasking.interfaces';

export type ArithmeticMode = 'positive' | 'twos-complement';

// Task-specific SubTaskConfig with TaskId enum constraint
export interface SubTaskConfig extends Omit<BaseSubTaskConfig, 'id'> {
  id: TaskId;
}

export interface TaskProgress {
  taskId: TaskId;
  completed: boolean;
  score?: number;
}

export interface IChapter {
  title: string;
  content?: string;
}
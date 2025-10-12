import { TaskId } from '../../../../shared/enums/taskId.enum';
import type { SubTaskComponentProps } from '../../../../shared/interfaces/tasking.interfaces';

export type ArithmeticMode = 'positive' | 'twos-complement';

export interface SubTaskConfig {
  id: TaskId;
  title: string;
  description: string;
  component: React.ComponentType<SubTaskComponentProps>;
  chapters?: IChapter[];
  timeLimit?: number; // milliseconds
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
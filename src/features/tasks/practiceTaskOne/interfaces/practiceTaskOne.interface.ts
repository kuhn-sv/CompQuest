import type { SubTaskComponentProps } from '../../../../shared/interfaces/tasking.interfaces';
export type SubTaskType = 'number-system' | 'positive-arithmetic' | 'complements' | 'quiz' | 'data-package' | 'twos-complement';

export type ArithmeticMode = 'positive' | 'twos-complement';

export interface SubTaskConfig {
  id: SubTaskType;
  title: string;
  description: string;
  component: React.ComponentType<SubTaskComponentProps>;
}

export interface TaskProgress {
  taskId: SubTaskType;
  completed: boolean;
  score?: number;
}
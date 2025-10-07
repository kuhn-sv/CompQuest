export type SubTaskType = 'number-system' | 'data-package' | 'twos-complement';

export interface SubTaskConfig {
  id: SubTaskType;
  title: string;
  description: string;
  component: React.ComponentType<SubTaskComponentProps>;
}

export interface SubTaskComponentProps {
  taskProgress?: {
    current: number;
    total: number;
  };
}

export interface TaskProgress {
  taskId: SubTaskType;
  completed: boolean;
  score?: number;
}
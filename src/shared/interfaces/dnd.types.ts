import { AnswerOption } from "../../features/tasks/practiceTaskOne/number-system/interfaces/numberSystem.interface";

export const DRAG_TYPES = {
  ANSWER: 'answer',
  TASK: 'task',
} as const;

export type DragType = typeof DRAG_TYPES[keyof typeof DRAG_TYPES];

export interface AnswerDragData<T = AnswerOption> {
  type: typeof DRAG_TYPES.ANSWER;
  answer: T;
  index: number;
}

export interface TaskDropData {
  type: typeof DRAG_TYPES.TASK;
  taskId: string;
}

export type DragData = AnswerDragData;
export type DropData = TaskDropData;

export const isAnswerDragData = <T = AnswerOption>(
  data: unknown
): data is AnswerDragData<T> => {
  return (data as AnswerDragData<T>)?.type === DRAG_TYPES.ANSWER;
};

export const isTaskDropData = (data: unknown): data is TaskDropData => {
  return (data as TaskDropData)?.type === DRAG_TYPES.TASK;
};
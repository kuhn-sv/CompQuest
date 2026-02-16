import { TaskId } from '@shared/enums/taskId.enum';
import { TASKS_DATA } from '@features/tasks/shared/data/tasks.data';
import type { Exercise } from '../exercises-list/ExercisesList.component';

export const NUMBER_REPRESENTATION_MISSIONS: Exercise[] = [
    {
        id: TaskId.NumberSystem,
        title: TASKS_DATA[TaskId.NumberSystem]?.title,
        description: TASKS_DATA[TaskId.NumberSystem]?.dashboardDescription ?? '',
        path: '/task/number-system',
        progressPercent: 100,
    },
    {
        id: TaskId.PositiveArithmetic,
        title: TASKS_DATA[TaskId.PositiveArithmetic]?.title,
        description: TASKS_DATA[TaskId.PositiveArithmetic]?.dashboardDescription ?? '',
        path: '/task/positive-arithmetic',
        progressPercent: 72,
    },
    {
        id: TaskId.Complements,
        title: TASKS_DATA[TaskId.Complements]?.title,
        description: TASKS_DATA[TaskId.Complements]?.dashboardDescription ?? '',
        path: '/task/complements',
        progressPercent: 0,
    },
    {
        id: TaskId.TwosComplementArithmetic,
        title: TASKS_DATA[TaskId.TwosComplementArithmetic]?.title,
        description: TASKS_DATA[TaskId.TwosComplementArithmetic]?.dashboardDescription ?? '',
        path: '/task/twos-complement-arithmetic',
        progressPercent: 0,
    },
    {
        id: TaskId.Quiz,
        title: TASKS_DATA[TaskId.Quiz]?.title,
        description: TASKS_DATA[TaskId.Quiz]?.dashboardDescription ?? '',
        path: '/task/quiz',
        progressPercent: 0,
    },
    {
        id: TaskId.FixedFloatingPoint,
        title: TASKS_DATA[TaskId.FixedFloatingPoint]?.title,
        description: TASKS_DATA[TaskId.FixedFloatingPoint]?.dashboardDescription ?? '',
        path: '/task/fixed-floating-point',
        progressPercent: 0,
    },
];

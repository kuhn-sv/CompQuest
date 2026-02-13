import { TaskId } from '@shared/enums/taskId.enum';
import { TASK_DISPLAY_NAMES } from '@shared/constants/taskDisplayNames';
import type { Exercise } from '../ExercisesList.component';

export const NUMBER_REPRESENTATION_MISSIONS: Exercise[] = [
    {
        id: TaskId.NumberSystem,
        title: TASK_DISPLAY_NAMES[TaskId.NumberSystem],
        description: 'Konvertiere zwischen binär, oktal & hexadezimal um.',
        path: '/task/number-system',
        progressPercent: 100,
    },
    {
        id: TaskId.PositiveArithmetic,
        title: TASK_DISPLAY_NAMES[TaskId.PositiveArithmetic],
        description: 'Addiere in binär, oktal & hexadezimal.',
        path: '/task/positive-arithmetic',
        progressPercent: 72,
    },
    {
        id: TaskId.Complements,
        title: TASK_DISPLAY_NAMES[TaskId.Complements],
        description: 'Stelle negative Zahlen im Binärsystem dar.',
        path: '/task/complements',
        progressPercent: 0,
    },
    {
        id: TaskId.TwosComplementArithmetic,
        title: TASK_DISPLAY_NAMES[TaskId.TwosComplementArithmetic],
        description:
            'Wende das Zweierkomplement in Rechnungen an und verstehe Vorzeichenoperationen.',
        path: '/task/twos-complement-arithmetic',
        progressPercent: 0,
    },
    {
        id: TaskId.Quiz,
        title: TASK_DISPLAY_NAMES[TaskId.Quiz],
        description:
            'Tim hat ein paar Fragen zu dem Thema. Kannst du sie beantworten?',
        path: '/task/quiz',
        progressPercent: 0,
    },
    {
        id: TaskId.FixedFloatingPoint,
        title: TASK_DISPLAY_NAMES[TaskId.FixedFloatingPoint],
        description: 'Wandle Dezimalzahlen in Fest- und Gleitkommadarstellung um.',
        path: '/task/fixed-floating-point',
        progressPercent: 0,
    },
];

import React from 'react';
import { TaskId } from '@shared/enums/taskId.enum';
import { TASK_DISPLAY_NAMES } from '@shared/constants/taskDisplayNames';
import { SubTaskConfig, SubTaskComponentProps } from '@shared/interfaces/tasking.interfaces';

import NumberSystemComponent from '../number-system/NumberSystem.component';
import FixedFloatingPointComponent from '../fixed-floating-point/FixedFloatingPoint.component';
import Quiz from '../quiz/Quiz.component';
import { PositiveArithmeticTask, TwosComplementArithmeticTask } from '../arithmetic';
import ComplementsComponent from '../complements';

export const numberRepresentationConfig: SubTaskConfig[] = [
    {
        id: TaskId.NumberSystem,
        title: TASK_DISPLAY_NAMES[TaskId.NumberSystem],
        description:
            'Verbinde Zahlen mit ihren Äquivalenten in verschiedenen Zahlensystemen.',
        chapters: [{ title: '3.1 Zahlensysteme' }],
        component:
            NumberSystemComponent as React.ComponentType<SubTaskComponentProps>,
        timeLimit: 5 * 60 * 1000,
    },
    {
        id: TaskId.PositiveArithmetic,
        title: TASK_DISPLAY_NAMES[TaskId.PositiveArithmetic],
        description: 'Additionen und Subtraktionen mit positiven Zahlen.',
        chapters: [{ title: '3.1 Zahlensysteme' }],
        component:
            PositiveArithmeticTask as React.ComponentType<SubTaskComponentProps>,
        timeLimit: 5 * 60 * 1000,
    },
    {
        id: TaskId.Complements,
        title: TASK_DISPLAY_NAMES[TaskId.Complements],
        description:
            'Verbinde Binärzahlen mit ihren Dezimalwerten und übe Einer-/Zweierkomplement.',
        chapters: [{ title: '3.2.1 Darstellung natürlicher Zahlen' }],
        component:
            ComplementsComponent as React.ComponentType<SubTaskComponentProps>,
        timeLimit: 5 * 60 * 1000,
    },
    {
        id: TaskId.TwosComplementArithmetic,
        title: TASK_DISPLAY_NAMES[TaskId.TwosComplementArithmetic],
        description:
            'Verbinde Operationen im Zweierkomplement und erkenne Überläufe.',
        chapters: [{ title: '3.2.1 Darstellung natürlicher Zahlen' }],
        component:
            TwosComplementArithmeticTask as React.ComponentType<SubTaskComponentProps>,
        timeLimit: 5 * 60 * 1000,
    },
    {
        id: TaskId.FixedFloatingPoint,
        title: TASK_DISPLAY_NAMES[TaskId.FixedFloatingPoint],
        description: 'Wandle Dezimalzahlen in Fest- und Gleitkommadarstellung um.',
        chapters: [{ title: '3.2.2 Gleitkommazahlen' }],
        component:
            FixedFloatingPointComponent as React.ComponentType<SubTaskComponentProps>,
        timeLimit: 10 * 60 * 1000,
    },
    {
        id: TaskId.Quiz,
        title: TASK_DISPLAY_NAMES[TaskId.Quiz],
        description: 'Beweise dein Wissen. ',
        component: Quiz as React.ComponentType<SubTaskComponentProps>,
        timeLimit: 2 * 60 * 1000,
    },
];

import React from 'react';
import { TaskId } from '@shared/enums/taskId.enum';
import { SubTaskConfig, SubTaskComponentProps } from '@shared/interfaces/tasking.interfaces';
import { TASKS_DATA } from '../../shared/data/tasks.data';

import NumberSystemComponent from '../number-system/NumberSystem.component';
import FixedFloatingPointComponent from '../fixed-floating-point/FixedFloatingPoint.component';
import Quiz from '../quiz/Quiz.component';
import { PositiveArithmeticTask, TwosComplementArithmeticTask } from '../arithmetic';
import ComplementsComponent from '../complements';

const ns = TASKS_DATA[TaskId.NumberSystem];
const pa = TASKS_DATA[TaskId.PositiveArithmetic];
const co = TASKS_DATA[TaskId.Complements];
const tc = TASKS_DATA[TaskId.TwosComplementArithmetic];
const ff = TASKS_DATA[TaskId.FixedFloatingPoint];
const qz = TASKS_DATA[TaskId.Quiz];

export const numberRepresentationConfig: SubTaskConfig[] = [
    {
        ...ns,
        component:
            NumberSystemComponent as React.ComponentType<SubTaskComponentProps>,
    },
    {
        ...pa,
        component:
            PositiveArithmeticTask as React.ComponentType<SubTaskComponentProps>,
    },
    {
        ...co,
        component:
            ComplementsComponent as React.ComponentType<SubTaskComponentProps>,
    },
    {
        ...tc,
        component:
            TwosComplementArithmeticTask as React.ComponentType<SubTaskComponentProps>,
    },
    {
        ...ff,
        component:
            FixedFloatingPointComponent as React.ComponentType<SubTaskComponentProps>,
    },
    {
        ...qz,
        component: Quiz as React.ComponentType<SubTaskComponentProps>,
    },
];

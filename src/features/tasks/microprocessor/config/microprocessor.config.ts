import React from 'react';
import { TaskId } from '@shared/enums/taskId.enum';
import { SubTaskConfig, SubTaskComponentProps } from '@shared/interfaces/tasking.interfaces';
import { TASKS_DATA } from '../../shared/data/tasks.data';

import {
    VonNeumann,
    ReadAssembly,
    WriteAssembly,
    JavaToAssembly,
} from '..';

const vn = TASKS_DATA[TaskId.VonNeumann];
const ra = TASKS_DATA[TaskId.ReadAssembly];
const wa = TASKS_DATA[TaskId.WriteAssembly];
const ja = TASKS_DATA[TaskId.JavaToAssembly];

export const microprocessorConfig: SubTaskConfig[] = [
    {
        ...vn,
        component: VonNeumann as React.ComponentType<SubTaskComponentProps>,
    },
    {
        ...ra,
        component: ReadAssembly as React.ComponentType<SubTaskComponentProps>,
    },
    {
        ...wa,
        component: WriteAssembly as React.ComponentType<SubTaskComponentProps>,
    },
    {
        ...ja,
        component: JavaToAssembly as React.ComponentType<SubTaskComponentProps>,
    },
];

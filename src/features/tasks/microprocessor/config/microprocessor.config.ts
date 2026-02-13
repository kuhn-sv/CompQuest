import React from 'react';
import { TaskId } from '@shared/enums/taskId.enum';
import { TASK_DISPLAY_NAMES } from '@shared/constants/taskDisplayNames';
import { SubTaskConfig, SubTaskComponentProps } from '@shared/interfaces/tasking.interfaces';

import {
    VonNeumann,
    ReadAssembly,
    WriteAssembly,
    JavaToAssembly,
} from '..';

export const microprocessorConfig: SubTaskConfig[] = [
    {
        id: TaskId.VonNeumann,
        title: TASK_DISPLAY_NAMES[TaskId.VonNeumann],
        description:
            'Identifiziere die Kernkomponenten der Von-Neumann-Architektur und rekonstruiere den Aufbau.',
        component: VonNeumann as React.ComponentType<SubTaskComponentProps>,
        chapters: [{ title: '11.1' }],
        timeLimit: 8 * 60 * 1000,
    },
    {
        id: TaskId.ReadAssembly,
        title: TASK_DISPLAY_NAMES[TaskId.ReadAssembly],
        description: 'Lies den Assembler-Code und beantworte die Fragen korrekt.',
        component: ReadAssembly as React.ComponentType<SubTaskComponentProps>,
        chapters: [{ title: '11.2' }],
        timeLimit: 8 * 60 * 1000,
    },
    {
        id: TaskId.WriteAssembly,
        title: TASK_DISPLAY_NAMES[TaskId.WriteAssembly],
        description: 'Sortiere die Befehle in die richtige Reihenfolge.',
        component: WriteAssembly as React.ComponentType<SubTaskComponentProps>,
        chapters: [{ title: '11.2' }],
        timeLimit: 8 * 60 * 1000,
    },
    {
        id: TaskId.JavaToAssembly,
        title: TASK_DISPLAY_NAMES[TaskId.JavaToAssembly],
        description:
            'Ordne die Befehle richtig an, um den Java Code in Assembler zu übersetzen.',
        component: JavaToAssembly as React.ComponentType<SubTaskComponentProps>,
        chapters: [{ title: '11.2' }],
        timeLimit: 8 * 60 * 1000,
    },
];

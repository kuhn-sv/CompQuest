import { TASK_DISPLAY_NAMES } from '@shared/constants/taskDisplayNames';
import { Exercise } from '../exercises-list/ExercisesList.component';

export const MICROPROCESSOR_MISSIONS: Exercise[] = [
    {
        id: 'von-neumann',
        title: TASK_DISPLAY_NAMES['von-neumann'],
        description: 'Quiz zur Von-Neumann-Architektur',
        path: '/task/von-neumann',
        progressPercent: undefined,
        disabled: false,
    },
    {
        id: 'read-assembly',
        title: TASK_DISPLAY_NAMES['read-assembly'],
        description: 'Lies den Assembler-Code und beantworte die Fragen',
        path: '/task/read-assembly',
        progressPercent: undefined,
        disabled: false,
    },
    {
        id: 'write-assembly',
        title: TASK_DISPLAY_NAMES['write-assembly'],
        description: 'Sortiere die Befehle in die richtige Reihenfolge',
        path: '/task/write-assembly',
        progressPercent: undefined,
        disabled: false,
    },
    {
        id: 'java-to-assembly',
        title: TASK_DISPLAY_NAMES['java-to-assembly'],
        description: 'Übersetze Java Code in Assembler',
        path: '/task/java-to-assembly',
        progressPercent: undefined,
        disabled: false,
    },
];

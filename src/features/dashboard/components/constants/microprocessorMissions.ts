import { TASKS_DATA } from '@features/tasks/shared/data/tasks.data';
import { Exercise } from '../exercises-list/ExercisesList.component';

export const MICROPROCESSOR_MISSIONS: Exercise[] = [
    {
        id: 'von-neumann',
        title: TASKS_DATA['von-neumann']?.title,
        description: TASKS_DATA['von-neumann']?.dashboardDescription ?? '',
        path: '/task/von-neumann',
        progressPercent: undefined,
        disabled: false,
    },
    {
        id: 'read-assembly',
        title: TASKS_DATA['read-assembly']?.title,
        description: TASKS_DATA['read-assembly']?.dashboardDescription ?? '',
        path: '/task/read-assembly',
        progressPercent: undefined,
        disabled: false,
    },
    {
        id: 'write-assembly',
        title: TASKS_DATA['write-assembly']?.title,
        description: TASKS_DATA['write-assembly']?.dashboardDescription ?? '',
        path: '/task/write-assembly',
        progressPercent: undefined,
        disabled: false,
    },
    {
        id: 'java-to-assembly',
        title: TASKS_DATA['java-to-assembly']?.title,
        description: TASKS_DATA['java-to-assembly']?.dashboardDescription ?? '',
        path: '/task/java-to-assembly',
        progressPercent: undefined,
        disabled: false,
    },
];

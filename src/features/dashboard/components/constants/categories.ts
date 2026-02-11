import { NUMBER_REPRESENTATION_MISSIONS } from './numberRepresentationMissions';
import { MICROPROCESSOR_MISSIONS } from './microprocessorMissions';
import { NUMBER_REPRESENTATION_HELPERS } from './numberRepresentationHelpers';
import { MICROPROCESSOR_HELPERS } from './microprocessorHelpers';
import type { ExerciseCategory } from '../../interfaces/exercise.interface';



export const EXERCISE_CATEGORIES: ExerciseCategory[] = [
    {
        id: 'zahlendarstellung',
        title: '1. Zahlendarstellung',
        badgeKey: 'zahlendarstellung',
        missions: NUMBER_REPRESENTATION_MISSIONS,
        helperModules: NUMBER_REPRESENTATION_HELPERS,
    },
    {
        id: 'mikroprozessortechnik',
        title: '2. Mikroprozessortechnik',
        badgeKey: 'mikroprozessortechnik',
        missions: MICROPROCESSOR_MISSIONS,
        helperModules: MICROPROCESSOR_HELPERS,
        lock: {
            requiredBadgeKey: 'zahlendarstellung',
            requiredLevel: 'bronze',
            hint: 'Erreiche mindestens Bronze in Zahlendarstellung',
        },
    },
];

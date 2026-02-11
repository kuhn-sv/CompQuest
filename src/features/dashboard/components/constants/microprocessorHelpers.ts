import type { Exercise } from '../../interfaces/exercise.interface';

// Note: If TaskId enum doesn't have an entry for befehlhelfer, we might need to add it or just use the slug string for now.
// Based on registry.ts, slug is 'befehlhelfer'.
// I'll check TaskId enum again, but I recall it didn't have HelperBefehlhelfer.
// I will use string literal for id to match how it was likely intended or add to TaskId if needed.
// Looking at TaskId enum in Step 72, it DOES NOT have HelperBefehlhelfer.
// I will use 'befehlhelfer' as ID.

export const MICROPROCESSOR_HELPERS: Exercise[] = [
    {
        id: 'befehlhelfer',
        title: 'Hilfsmodul: Befehlhelfer',
        description: 'Ordne Assembler-Begriffe ihren Beschreibungen zu',
        path: '/hilfsmodul/befehlhelfer',
    },
];

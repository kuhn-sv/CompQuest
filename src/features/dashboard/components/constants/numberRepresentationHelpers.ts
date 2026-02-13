import { TaskId } from '@shared/enums/taskId.enum';
import type { Exercise } from '../../interfaces/exercise.interface';

export const NUMBER_REPRESENTATION_HELPERS: Exercise[] = [
    {
        id: TaskId.HelperPotenzrechner,
        title: 'Hilfsmodul: Potenzrechner',
        description:
            'Stelle Zahlen in Binär/Oktal/Hexadezimal dar – mit Potenzen als Hilfestellung.',
        path: '/hilfsmodul/potenzrechner',
    },
    {
        id: TaskId.HelperUmrechnungshelfer,
        title: 'Hilfsmodul: Umrechnungshelfer',
        description:
            'Umrechnung zwischen Binär ⇆ Oktal ⇆ Hexadezimal (Schritt für Schritt).',
        path: '/hilfsmodul/umrechnungshelfer',
    },
    {
        id: TaskId.HelperUebertragshelfer,
        title: 'Hilfsmodul: Übertragshelfer',
        description: 'Addiere Zahlen und markiere Überträge in Binär/Oktal/Hexadezimal.',
        path: '/hilfsmodul/uebertragshelfer',
    },
];

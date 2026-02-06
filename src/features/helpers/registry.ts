import type { SubTaskComponentProps } from '../tasks/practiceTaskOne/interfaces';

export type HelperSlug = 'potenzrechner' | 'umrechnungshelfer' | 'befehlhelfer';

export interface HelperModuleConfig {
  slug: HelperSlug | string;
  title: string;
  description?: string;
  component: React.ComponentType<SubTaskComponentProps>;
}

import Befehlhelfer from './befehlhelfer/Befehlhelfer.component';
import Potenzrechner from './potenzrechner/Potenzrechner.component';
import Umrechnungshelfer from './umrechnungshelfer/Umrechnungshelfer.component';

export const helperModules: Record<string, HelperModuleConfig> = {
  befehlhelfer: {
    slug: 'befehlhelfer',
    title: 'Befehlhelfer',
    description: 'Ordne Assembler-Begriffe ihren Beschreibungen zu',
    component: Befehlhelfer,
  },
  potenzrechner: {
    slug: 'potenzrechner',
    title: 'Hilfsmodul: Potenzrechner',
    description:
      'Stelle Zahlen in Binär/Oktal/Hexadezimal dar – mit Potenzen als Hilfestellung.',
    component: Potenzrechner,
  },
  umrechnungshelfer: {
    slug: 'umrechnungshelfer',
    title: 'Hilfsmodul: Umrechnungshelfer',
    description:
      'Umrechnung zwischen Binär ⇆ Oktal ⇆ Hexadezimal (Schritt für Schritt).',
    component: Umrechnungshelfer,
  },
};

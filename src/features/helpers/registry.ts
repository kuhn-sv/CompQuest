import type { SubTaskComponentProps } from '../tasks/practiceTaskOne/interfaces';

export type HelperSlug = 'potenzrechner' | 'umrechnungshelfer' | 'befehlhelfer' | 'uebertragshelfer';

export type HelperTopic = 'zahlendarstellung' | 'mikroprozessortechnik';

export interface HelperModuleConfig {
  slug: HelperSlug | string;
  title: string;
  description?: string;
  component: React.ComponentType<SubTaskComponentProps>;
  topic: HelperTopic;
}

import Befehlhelfer from './befehlhelfer/Befehlhelfer.component';
import Potenzrechner from './potenzrechner/Potenzrechner.component';
import Umrechnungshelfer from './umrechnungshelfer/Umrechnungshelfer.component';
import Uebertragshelfer from './uebertragshelfer/Uebertragshelfer.component';

export const helperModules: Record<string, HelperModuleConfig> = {
  befehlhelfer: {
    slug: 'befehlhelfer',
    title: 'Hilfsmodul: Befehlhelfer',
    description: 'Ordne Assembler-Begriffe ihren Beschreibungen zu',
    component: Befehlhelfer,
    topic: 'mikroprozessortechnik',
  },
  potenzrechner: {
    slug: 'potenzrechner',
    title: 'Hilfsmodul: Potenzrechner',
    description:
      'Stelle Zahlen in Binär/Oktal/Hexadezimal dar – mit Potenzen als Hilfestellung.',
    component: Potenzrechner,
    topic: 'zahlendarstellung',
  },
  umrechnungshelfer: {
    slug: 'umrechnungshelfer',
    title: 'Hilfsmodul: Umrechnungshelfer',
    description:
      'Umrechnung zwischen Binär ⇆ Oktal ⇆ Hexadezimal (Schritt für Schritt).',
    component: Umrechnungshelfer,
    topic: 'zahlendarstellung',
  },
  uebertragshelfer: {
    slug: 'uebertragshelfer',
    title: 'Übertragshelfer',
    description:
      'Addiere Zahlen und markiere Überträge in Binär/Oktal/Hexadezimal.',
    component: Uebertragshelfer,
    topic: 'zahlendarstellung',
  },
};

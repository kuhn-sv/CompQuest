import type { SubTaskComponentProps } from '../tasks/practiceTaskOne/interfaces';

export type HelperSlug = 'potenzrechner';

export interface HelperModuleConfig {
  slug: HelperSlug | string;
  title: string;
  description?: string;
  component: React.ComponentType<SubTaskComponentProps>;
}

import Potenzrechner from './potenzrechner/Potenzrechner.component';
import Umrechnungshelfer from './umrechnungshelfer/Umrechnungshelfer.component';

export const helperModules: Record<string, HelperModuleConfig> = {
  potenzrechner: {
    slug: 'potenzrechner',
    title: 'Potenzrechner',
    description: 'Stelle Zahlen binär/oktal/hexadezimal dar und nutze Potenzen als Hilfe.',
    component: Potenzrechner,
  },
  umrechnungshelfer: {
    slug: 'umrechnungshelfer',
    title: 'Umrechnungshelfer',
    description: 'Leitfaden zur Umrechnung zwischen Binär, Oktal, Hex – Schritt für Schritt.',
    component: Umrechnungshelfer,
  },
};

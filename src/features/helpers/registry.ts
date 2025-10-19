import type { SubTaskComponentProps } from '../tasks/practiceTaskOne/interfaces';

export type HelperSlug = 'potenzrechner';

export interface HelperModuleConfig {
  slug: HelperSlug | string;
  title: string;
  description?: string;
  component: React.ComponentType<SubTaskComponentProps>;
}

import Befehlhelfer from './befehlhelfer/Befehlhelfer.component';

export const helperModules: Record<string, HelperModuleConfig> = {
  befehlhelfer: {
    slug: 'befehlhelfer',
    title: 'Befehlhelfer',
    description: 'Ordne Assembler-Begriffe ihren Beschreibungen zu',
    component: Befehlhelfer,
  },
};

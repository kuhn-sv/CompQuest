import { useCallback, useState } from 'react';

export type ModeTab = 'binhex' | 'binoct' | 'octhex';

export const useStepperExpanded = (initial?: Partial<Record<ModeTab, boolean>>) => {
  const [expanded, setExpanded] = useState<Record<ModeTab, boolean>>({
    binhex: false,
    binoct: false,
    octhex: false,
    ...initial,
  });

  const toggle = useCallback((key: ModeTab) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const reset = useCallback(() => {
    setExpanded({ binhex: false, binoct: false, octhex: false });
  }, []);

  return { expanded, toggle, reset } as const;
};

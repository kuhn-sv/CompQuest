// Lightweight device detection hook
// Returns booleans for isMobile, isTablet, isDesktop
import { useEffect, useState } from 'react';

const TABLET_MEDIA = '(pointer: coarse) and (min-width: 600px) and (max-width: 1024px)';

export function useDeviceType() {
  const [isTablet, setIsTablet] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.matchMedia && window.matchMedia(TABLET_MEDIA).matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mq = window.matchMedia(TABLET_MEDIA);
    // handler compatible with both modern and legacy signatures
    const handler = (ev: MediaQueryListEvent | MediaQueryList) => {
      const matches = 'matches' in ev ? ev.matches : mq.matches;
      setIsTablet(Boolean(matches));
    };

    // If browser supports addEventListener on MediaQueryList
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handler as EventListener);
      return () => mq.removeEventListener('change', handler as EventListener);
    }

    // Legacy path: some environments expose addListener/removeListener
    const mqLegacy = mq as MediaQueryList & {
      addListener?: (listener: (mql: MediaQueryList) => void) => void;
      removeListener?: (listener: (mql: MediaQueryList) => void) => void;
    };

    if (typeof mqLegacy.addListener === 'function') {
      const legacyListener = (mql: MediaQueryList) => handler(mql);
      mqLegacy.addListener(legacyListener);
      return () => mqLegacy.removeListener && mqLegacy.removeListener(legacyListener);
    }

    // Fallback: subscribe to resize and evaluate the media query manually
    const onResize = () => setIsTablet(window.matchMedia?.(TABLET_MEDIA)?.matches ?? false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return { isTablet };
}

export default useDeviceType;

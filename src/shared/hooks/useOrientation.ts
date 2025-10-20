// Hook to detect screen orientation
// Returns isPortrait boolean that updates when device orientation changes
import { useEffect, useState } from 'react';

const PORTRAIT_MEDIA = '(orientation: portrait)';

export function useOrientation() {
  const [isPortrait, setIsPortrait] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.matchMedia && window.matchMedia(PORTRAIT_MEDIA).matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mq = window.matchMedia(PORTRAIT_MEDIA);
    
    // Handler compatible with both modern and legacy signatures
    const handler = (ev: MediaQueryListEvent | MediaQueryList) => {
      const matches = 'matches' in ev ? ev.matches : mq.matches;
      setIsPortrait(Boolean(matches));
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
    const onResize = () => setIsPortrait(window.matchMedia?.(PORTRAIT_MEDIA)?.matches ?? false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return { isPortrait };
}

export default useOrientation;



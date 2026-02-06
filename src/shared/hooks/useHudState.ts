import {useEffect, useRef} from 'react';
import type {TaskHudState} from '../interfaces/tasking.interfaces';

/**
 * Manages HUD-state synchronisation between a task component and its
 * `TaskContainer` parent.
 *
 * The hook ref-stabilises `onHudChange` so that callers never need to include
 * it in their own dependency arrays. It forwards whatever `hudState` it
 * receives to the parent, and on unmount it sends `null` to reset the HUD.
 *
 * @param onHudChange Callback provided by `TaskContainer` via render-props.
 * @param hudState    The current HUD state to report, or `null` to clear.
 */
export function useHudState(
  onHudChange: ((hud: TaskHudState | null) => void) | undefined,
  hudState: TaskHudState | null,
): void {
  const cbRef = useRef(onHudChange);
  useEffect(() => {
    cbRef.current = onHudChange;
  }, [onHudChange]);

  // Forward HUD state to parent whenever it changes
  useEffect(() => {
    cbRef.current?.(hudState);
  }, [hudState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cbRef.current?.(null);
    };
  }, []);
}

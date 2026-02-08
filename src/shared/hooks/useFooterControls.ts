import {useEffect, useMemo, useRef} from 'react';
import type {TaskFooterControls} from '../interfaces/tasking.interfaces';

/**
 * Flags controlling the visibility and disabled state of footer action buttons.
 * All fields are optional and default to sensible values via the consuming
 * component (`TaskActionButtons`).
 */
export interface FooterControlFlags {
  showReset?: boolean;
  showEvaluate?: boolean;
  showNext?: boolean;
  disableReset?: boolean;
  disableNext?: boolean;
}

/**
 * The three action handlers exposed by a task to its parent container.
 */
export interface FooterControlHandlers {
  onReset: () => void;
  onEvaluate: () => void;
  onNext: () => void;
}

/**
 * Manages footer-control synchronisation between a task component and its
 * `TaskContainer` parent.
 *
 * Uses a single ref to keep handler references fresh while the `controls`
 * object's identity only changes when a flag value changes. The parent is
 * notified via `onControlsChange` whenever `controls` changes, and
 * receives `null` on unmount.
 *
 * @param onControlsChange Callback provided by `TaskContainer` via render-props.
 * @param handlers         The three action handlers (`onReset`, `onEvaluate`, `onNext`).
 * @param flags            Visibility/disabled flags for the three buttons.
 * @param active           When `false` the controls are cleared (`null`); typically `hasStarted`.
 */
export function useFooterControls(
  onControlsChange: ((controls: TaskFooterControls | null) => void) | undefined,
  handlers: FooterControlHandlers,
  flags: FooterControlFlags,
  active: boolean,
): void {
  // --- Keep handler references fresh without changing object identity ---
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });

  // --- Build the controls object (identity only changes when flags change) ---
  const controls = useMemo<TaskFooterControls | null>(() => {
    if (!active) return null;
    return {
      onReset: () => handlersRef.current.onReset(),
      onEvaluate: () => handlersRef.current.onEvaluate(),
      onNext: () => handlersRef.current.onNext(),
      showReset: flags.showReset,
      showEvaluate: flags.showEvaluate,
      showNext: flags.showNext,
      disableReset: flags.disableReset,
      disableNext: flags.disableNext,
    };
  }, [
    active,
    flags.showReset,
    flags.showEvaluate,
    flags.showNext,
    flags.disableReset,
    flags.disableNext,
  ]);

  // --- Notify parent when controls change; reset to null on unmount ---
  useEffect(() => {
    onControlsChange?.(controls);
    return () => {
      onControlsChange?.(null);
    };
  }, [controls, onControlsChange]);
}

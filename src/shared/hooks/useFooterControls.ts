import {useCallback, useEffect, useMemo, useRef} from 'react';
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
 * Internally uses ref-stabilised handler wrappers so that the `controls`
 * object's identity only changes when a flag value changes — not when a
 * handler is re-created. Parent notifications are deduplicated so
 * `onControlsChange` is only called when necessary, and a single cleanup
 * on unmount resets the controls to `null`.
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
  // --- Ref-stabilise handlers so useMemo identity only depends on flags ---
  const resetRef = useRef(handlers.onReset);
  const evaluateRef = useRef(handlers.onEvaluate);
  const nextRef = useRef(handlers.onNext);

  useEffect(() => {
    resetRef.current = handlers.onReset;
  }, [handlers.onReset]);
  useEffect(() => {
    evaluateRef.current = handlers.onEvaluate;
  }, [handlers.onEvaluate]);
  useEffect(() => {
    nextRef.current = handlers.onNext;
  }, [handlers.onNext]);

  const onResetStable = useCallback(() => resetRef.current(), []);
  const onEvaluateStable = useCallback(() => evaluateRef.current(), []);
  const onNextStable = useCallback(() => nextRef.current(), []);

  // --- Build the controls object (identity only changes when flags change) ---
  const controls = useMemo<TaskFooterControls | null>(() => {
    if (!active) return null;
    return {
      onReset: onResetStable,
      onEvaluate: onEvaluateStable,
      onNext: onNextStable,
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
    onResetStable,
    onEvaluateStable,
    onNextStable,
  ]);

  // --- Notify parent only when the controls object really changes ---
  const prevRef = useRef<TaskFooterControls | null>(null);
  const cbRef = useRef(onControlsChange);
  useEffect(() => {
    cbRef.current = onControlsChange;
  }, [onControlsChange]);

  useEffect(() => {
    if (prevRef.current !== controls) {
      cbRef.current?.(controls);
      prevRef.current = controls;
    }
  }, [controls]);

  // --- Cleanup on unmount (ref-based, no dependency on callback identity) ---
  useEffect(() => {
    return () => {
      cbRef.current?.(null);
    };
  }, []);
}

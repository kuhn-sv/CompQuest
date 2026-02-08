import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  TaskFooterControls,
  TaskHudState,
  TaskSummaryState,
} from '../interfaces/tasking.interfaces';
import {useFooterControls} from './useFooterControls';
import type {FooterControlFlags} from './useFooterControls';
import {useHudState} from './useHudState';

/**
 * Options accepted by {@link useHelperTask}.
 */
export interface UseHelperTaskOptions {
  /** Callback from `SubTaskComponentProps`. */
  onControlsChange?: (controls: TaskFooterControls | null) => void;
  /** Callback from `SubTaskComponentProps`. */
  onHudChange?: (hud: TaskHudState | null) => void;
  /** Callback from `SubTaskComponentProps`. */
  onSummaryChange?: (summary: Partial<TaskSummaryState> | null) => void;

  /**
   * Called when a **new task** should be generated (initial load, Reset, Next).
   * The implementation should reset all module-specific state and create a new
   * random task.
   */
  generateTask: () => void;

  /** Reactive HUD state (subtitle, progress, …). */
  hudState: TaskHudState | null;

  /** Optional overrides for footer-button visibility/disabled state. */
  footerFlags?: FooterControlFlags;
}

/**
 * Return value of {@link useHelperTask}.
 */
export interface UseHelperTaskResult {
  /** `true` after the user clicked "Auswerten" until the next task. */
  evaluated: boolean;
}

const DEFAULT_FLAGS: FooterControlFlags = {
  showReset: true,
  showEvaluate: true,
  showNext: true,
  disableReset: false,
  disableNext: false,
};

/**
 * Shared lifecycle hook for all helper modules.
 *
 * Encapsulates:
 * - `evaluated` state (set on Evaluate, cleared on new task)
 * - One-time initialisation (`initializedRef` pattern)
 * - Cleanup of `onSummaryChange` on unmount
 * - Footer controls wiring (`useFooterControls`)
 * - HUD state forwarding (`useHudState`)
 */
export function useHelperTask({
  onControlsChange,
  onHudChange,
  onSummaryChange,
  generateTask,
  hudState,
  footerFlags,
}: UseHelperTaskOptions): UseHelperTaskResult {
  const [evaluated, setEvaluated] = useState(false);
  const flags = footerFlags ?? DEFAULT_FLAGS;

  // Ref-stabilise `generateTask` so callbacks below never go stale.
  const generateRef = useRef(generateTask);
  useEffect(() => {
    generateRef.current = generateTask;
  }, [generateTask]);

  // --- Footer handlers ---
  const handleReset = useCallback(() => {
    setEvaluated(false);
    generateRef.current();
  }, []);

  const handleEvaluate = useCallback(() => {
    setEvaluated(true);
  }, []);

  const handleNext = useCallback(() => {
    setEvaluated(false);
    generateRef.current();
  }, []);

  useFooterControls(
    onControlsChange,
    {onReset: handleReset, onEvaluate: handleEvaluate, onNext: handleNext},
    flags,
    true,
  );

  // --- HUD ---
  useHudState(onHudChange, hudState);

  // --- One-time init ---
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      generateRef.current();
      onHudChange?.({progress: null, requestTimer: 'reset'});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Cleanup summary on unmount ---
  const summaryRef = useRef(onSummaryChange);
  useEffect(() => {
    summaryRef.current = onSummaryChange;
  }, [onSummaryChange]);

  useEffect(() => {
    return () => {
      summaryRef.current?.(null);
    };
  }, []);

  return {evaluated};
}

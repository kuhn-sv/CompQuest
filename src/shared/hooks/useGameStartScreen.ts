import { useCallback, useState } from 'react';
import type { TaskHudState } from '../interfaces/tasking.interfaces';

export interface UseGameStartScreenOptions {
  /** Callback provided by TaskContainer to update HUD state. */
  onHudChange?: (hud: TaskHudState | null) => void;
  /** Total number of tasks/rounds — shown in the HUD progress after start. */
  totalTasks: number;
  /** Optional subtitle displayed in the HUD after the game starts. */
  subtitle?: string;
}

export interface UseGameStartScreenResult {
  /** Whether the user has clicked "Start". */
  hasStarted: boolean;
  /**
   * Call this (or compose it) from `GameStartScreen.onStart`.
   * Sets `hasStarted = true`, tells the container to start its timer,
   * and reports initial progress to the HUD.
   */
  startTask: () => void;
}

export function useGameStartScreen({
  onHudChange,
  totalTasks,
  subtitle,
}: UseGameStartScreenOptions): UseGameStartScreenResult {
  const [hasStarted, setHasStarted] = useState(false);

  const startTask = useCallback(() => {
    setHasStarted(true);
    // Immediately tell the container to start the timer and show progress
    onHudChange?.({
      progress: { current: 1, total: totalTasks },
      requestTimer: 'start',
      isStartScreen: false,
      ...(subtitle ? { subtitle } : {}),
    });
  }, [onHudChange, totalTasks, subtitle]);

  return { hasStarted, startTask };
}

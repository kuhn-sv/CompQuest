export type ArithmeticMode = 'positive' | 'twos-complement';

// Props that any task-like child component can receive from the container host
export interface SubTaskComponentProps {
  taskProgress?: {
    current: number;
    total: number;
  };
  // Allow a subtask to provide footer control handlers and visibility/disabled state to the parent
  onControlsChange?: (controls: TaskFooterControls | null) => void;
  // Allow a subtask to report HUD state (progress and timer control) to be shown in the container header
  onHudChange?: (hud: TaskHudState | null) => void;
  // Allow a subtask to report final summary up to container for unified overlay rendering
  onSummaryChange?: (summary: TaskSummaryState | null) => void;
  // Optional arithmetic mode used by some subtasks (e.g., positive vs twos-complement arithmetic)
  arithmeticMode?: ArithmeticMode;
}

// Shape of controls the subtask can expose to be rendered in the parent footer
export interface TaskFooterControls {
  onReset?: () => void;
  onEvaluate: () => void;
  onNext?: () => void;
  showReset?: boolean;
  showEvaluate?: boolean;
  showNext?: boolean;
  disableReset?: boolean;
  disableEvaluate?: boolean;
  disableNext?: boolean;
}

export interface TaskHudState {
  progress: { current: number; total: number } | null;
  requestTimer?: 'start' | 'stop' | 'reset';
  subtitle?: string; // optional subtitle shown under title
  // When true, a start screen is being shown by the child task and the footer should be hidden
  isStartScreen?: boolean;
}

// Normalized summary payload for the container-level overlay
export interface TaskStageScore {
  difficulty: string; // display label; keep generic for cross-task compatibility
  correct: number;
  total: number;
  points: number;
}

export interface TaskSummaryState {
  elapsedMs: number;
  withinThreshold: boolean;
  timeBonus: number;
  perStage: TaskStageScore[];
  totalCorrect: number;
  totalPossible: number;
  totalPoints: number;
  thresholdMs: number; // used for display
}

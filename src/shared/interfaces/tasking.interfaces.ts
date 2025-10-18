export type ArithmeticMode = 'positive' | 'twos-complement';

// Configuration for a subtask
export interface SubTaskConfig {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<SubTaskComponentProps>;
  chapters?: { title: string; content?: string }[];
  timeLimit?: number; // milliseconds
}

// Props that any task-like child component can receive from the container host
export interface SubTaskComponentProps {
  taskProgress?: {
    current: number;
    total: number;
  };
  // Optional metadata about the current subtask to enable progress reporting
  taskMeta?: {
    id: string;
    title: string;
    chapters?: { title: string; content?: string }[];
    timeLimit?: number;
  };
  // Allow a subtask to provide footer control handlers and visibility/disabled state to the parent
  onControlsChange?: (controls: TaskFooterControls | null) => void;
  // Allow a subtask to report HUD state (progress and timer control) to be shown in the container header
  onHudChange?: (hud: TaskHudState | null) => void;
  // Allow a subtask to report final summary up to container for unified overlay rendering
  // Child may send partial summary; container will normalize it
  onSummaryChange?: (summary: Partial<TaskSummaryState> | null) => void;
  // Optional: allow a subtask to provide the current visible task context
  // (human-readable prompt, variables). This will be forwarded to the
  // AskTim modal so the assistant can use the exact task statement.
  onTaskContextChange?: (context: unknown | null) => void;
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

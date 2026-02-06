import { TaskFooterControls, TaskHudState, TaskSummaryState } from "./tasking.interfaces";

export interface TaskContainerInjectedProps {
  onControlsChange: (controls: TaskFooterControls | null) => void;
  onHudChange: (hud: TaskHudState | null) => void;
  // Subtasks can provide the current visible task context (prompt, values, etc.)
  // This will be forwarded to the "Ask Tim" modal so the assistant can use
  // the exact task statement when answering.
  onTaskContextChange: (context: unknown | null) => void;
  // Subtasks may send partial summaries; container will normalize them
  onSummaryChange: (summary: Partial<TaskSummaryState> | null) => void;
  // Returns the container-level elapsed time in ms (single source of truth).
  getElapsed: () => number;
}

export interface TaskContainerProps {
  title: string;
  description?: string;
  endHref?: string;
  endLabel?: string;
  endState?: Record<string, unknown>; // passed as location.state when navigating via endHref
  // Optional meta to record progress in DB on completion
  taskMeta?: {
    id: string;
    title: string;
    chapters?: {title: string; content?: string}[];
    timeLimit?: number;
  };
  // When true, footer visibility ignores HUD gating (start screen/progress)
  forceShowFooter?: boolean;
  // When true, timer will start automatically on mount
  autoStartTimer?: boolean;
  children: (injected: TaskContainerInjectedProps) => React.ReactNode;
}
// Level (Component), Quest, Task domain interfaces and user progress types

export interface ComponentLevel {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  modelKey?: string; // 3D model mapping
  orderIndex: number;
  prerequisiteComponentId?: string | null;
}

export interface Quest {
  id: string;
  componentId: string;
  title: string;
  description?: string;
  orderIndex: number;
}

export interface Task {
  id: string;
  questId: string;
  title: string;
  description?: string;
  orderIndex: number;
  pointsMaxSpeed: number;
  pointsMaxAccuracy: number;
}

export type ComponentStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed';

export interface UserComponentProgress {
  userId: string;
  componentId: string;
  status: ComponentStatus;
  unlockedAt?: string | null;
  lastAttemptAt?: string | null;
  lastCompletedAt?: string | null;
  attemptsCount: number;
  bestTotalPoints: number;
}

export interface UserTaskAttempt {
  id: string;
  userId: string;
  taskId: string;
  createdAt: string;
  durationMs?: number;
  speedPoints: number;
  accuracyPoints: number;
  totalPoints: number;
}

export interface UserTaskBest {
  userId: string;
  taskId: string;
  bestAttemptId?: string | null;
  bestSpeedPoints: number;
  bestAccuracyPoints: number;
  bestTotalPoints: number;
  updatedAt: string;
}

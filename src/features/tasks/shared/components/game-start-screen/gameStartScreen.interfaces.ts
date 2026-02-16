import React from 'react';

export interface BestAttempt {
  timeMs: number;
  accuracyPercent: number; // 0-100
  points: number;
  // Optional metadata for later use
  date?: string | Date;
}

export interface GameStartScreenProps {
  // Main status block on the left
  statusTitle: string;
  statusDescription: string | React.ReactNode;

  // Quick facts on the right
  taskCount: number;
  estimatedTime: number; // milliseconds – rendered as "~X min"

  // Optional best attempt summary
  bestAttempt?: BestAttempt | null;

  // Optional: When provided, the component will try to load the user's best attempt
  // for this task from the database (ignored if bestAttempt is explicitly passed).
  fetchBestAttempt?: boolean;
  taskId?: string;

  // Start CTA
  onStart: () => void;
  startLabel?: string; // default: "Mission starten"

  className?: string;
}

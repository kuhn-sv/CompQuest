export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  matrikelnummer: string;
  // 'student' | 'admin'
  role?: 'student' | 'admin';
  createdAt: string;
  lastLoginAt: string;
  preferences: UserPreferences;
  progress: UserProgress;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'de';
  notifications: {
    email: boolean;
    achievements: boolean;
    reminders: boolean;
  };
}

export interface UserProgress {
  // High-level stats (can be derived but kept for fast UI)
  totalPoints: number;
  level: number; // current component index or derived level
  achievements: Achievement[];
  // Detailed progress tracking keys
  completedTasks: string[]; // task ids completed at least once
  currentTask?: string;
  statistics: {
    tasksCompleted: number;
    timeSpent: number; // minutes
    avgTaskTime: number; // minutes
    lastActivity: string;
  };
}

// Game content interfaces (for UI typing)
// Level/quest/task-related interfaces moved to
// src/features/dashboard/interfaces/levels.interfaces.ts

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  points: number;
}

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean; // action-level loading (sign in/out, resend, etc.)
  initialized: boolean; // true after first auth session check completes
  error: string | null;
  emailVerificationRequired: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, matrikelnummer: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendEmailVerification: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  clearEmailVerificationRequired: () => void;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  displayName: string;
  matrikelnummer: string;
  confirmPassword: string;
}

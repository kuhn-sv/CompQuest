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
  gamertag: string;
  leaderboardOptIn: boolean;
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

  totalPoints: number;
  level: number;
  achievements: Achievement[];
  completedTasks: string[];
  currentTask?: string;
  hasCompletedOnboarding?: boolean;
  statistics: {
    tasksCompleted: number;
    timeSpent: number; // minutes
    avgTaskTime: number; // minutes
    lastActivity: string;
  };
}

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
  signUp: (email: string, password: string, displayName: string, matrikelnummer: string, gamertag: string, leaderboardOptIn: boolean) => Promise<void>;
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
  gamertag: string;
  confirmPassword: string;
  leaderboardOptIn: boolean;
}

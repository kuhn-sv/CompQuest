import { User as FirebaseUser } from 'firebase/auth';

export interface User extends FirebaseUser {
  displayName: string | null;
  email: string | null;
  uid: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  matrikelnummer: string;
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
  completedTasks: string[];
  currentTask?: string;
  totalPoints: number;
  level: number;
  achievements: Achievement[];
  statistics: {
    tasksCompleted: number;
    timeSpent: number; // in minutes
    avgTaskTime: number; // in minutes
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
  loading: boolean;
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
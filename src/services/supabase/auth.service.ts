import supabase from './client';
import { UserProfile, UserPreferences, UserProgress } from '../../types/auth.types';

type ErrorWithCode = Error & { code?: string };

// Defaults similar to current Firebase implementation
const defaultPreferences: UserPreferences = {
  theme: 'auto',
  language: 'de',
  notifications: { email: true, achievements: true, reminders: false },
};

const defaultProgress: UserProgress = {
  completedTasks: [],
  totalPoints: 0,
  level: 1,
  achievements: [],
  statistics: {
    tasksCompleted: 0,
    timeSpent: 0,
    avgTaskTime: 0,
    lastActivity: new Date().toISOString(),
  },
};

const nowIso = () => new Date().toISOString();

// Ensure a profile row exists for the given auth user id
const ensureUserProfile = async (uid: string, email: string, displayName?: string | null, matrikelnummer?: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', uid)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = No rows
    throw error;
  }

  if (!data) {
    const profile: UserProfile = {
      uid,
      email,
      displayName: displayName || '',
      matrikelnummer: matrikelnummer || '',
      createdAt: nowIso(),
      lastLoginAt: nowIso(),
      preferences: defaultPreferences,
      progress: defaultProgress,
    };

    const insert = await supabase.from('profiles').insert({
      id: uid,
      email: profile.email,
      display_name: profile.displayName,
      matrikelnummer: profile.matrikelnummer,
      preferences: profile.preferences,
      progress: profile.progress,
      created_at: profile.createdAt,
      last_login_at: profile.lastLoginAt,
      updated_at: profile.createdAt,
    });
    if (insert.error) throw insert.error;
  } else {
    // Update last login timestamp
    const upd = await supabase
      .from('profiles')
      .update({ last_login_at: nowIso(), updated_at: nowIso() })
      .eq('id', uid);
    if (upd.error) throw upd.error;
  }
};

export const authService = {
  // Sign up new user (no session until email confirmed if confirm required)
  signUp: async (email: string, password: string, displayName: string, matrikelnummer: string): Promise<void> => {
    const redirectTo = (import.meta.env.VITE_AUTH_LOGIN_REDIRECT as string) || `${window.location.origin}/auth/login`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: { displayName, matrikelnummer },
      },
    });
    if (error) {
      const err: ErrorWithCode = new Error(error.message);
      err.code = error.code || 'auth/signup-failed';
      throw err;
    }
    // Profile row will be created on first successful sign-in after verification
  },

  // Sign in existing user
  signIn: async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const err: ErrorWithCode = new Error(error.message);
      err.code = error.code || 'auth/signin-failed';
      throw err;
    }
    const user = data.user;
    if (user) {
      // If project requires confirmed email, unconfirmed users won't get a session
      await ensureUserProfile(user.id, user.email || '', user.user_metadata?.displayName, user.user_metadata?.matrikelnummer);
    }
  },

  // Sign out user
  signOut: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Reset password (sends email with link to reset route)
  resetPassword: async (email: string): Promise<void> => {
    const redirectTo = (import.meta.env.VITE_AUTH_RESET_REDIRECT as string) || `${window.location.origin}/auth/reset`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
  },

  // Resend email verification
  resendEmailVerification: async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  },

  // Update user profile (top-level fields)
  updateUserProfile: async (uid: string, data: Partial<UserProfile>): Promise<void> => {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.displayName !== undefined) payload.display_name = data.displayName;
    if (data.matrikelnummer !== undefined) payload.matrikelnummer = data.matrikelnummer;
    if (data.email !== undefined) payload.email = data.email;
    if (data.lastLoginAt !== undefined) payload.last_login_at = data.lastLoginAt;
    if (data.preferences !== undefined) payload.preferences = data.preferences;
    if (data.progress !== undefined) payload.progress = data.progress;

    const { error } = await supabase.from('profiles').update(payload).eq('id', uid);
    if (error) throw error;
  },
};

export const userProfileService = {
  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null; // no rows
      console.error('Error getting user profile:', error);
      return null;
    }
    return data
      ? {
          uid: data.id,
          email: data.email,
          displayName: data.display_name,
          matrikelnummer: data.matrikelnummer,
          role: (data.role as 'student' | 'admin' | undefined) ?? 'student',
          createdAt: data.created_at,
          lastLoginAt: data.last_login_at,
          preferences: data.preferences ?? defaultPreferences,
          progress: data.progress ?? defaultProgress,
        }
      : null;
  },

  updatePreferences: async (uid: string, preferences: Partial<UserPreferences>): Promise<void> => {
    // Merge on client to keep simple
    const current = await userProfileService.getUserProfile(uid);
    const merged = { ...(current?.preferences ?? defaultPreferences), ...preferences };
    const { error } = await supabase.from('profiles').update({ preferences: merged, updated_at: nowIso() }).eq('id', uid);
    if (error) throw error;
  },

  updateProgress: async (uid: string, progress: Partial<UserProgress>): Promise<void> => {
    const current = await userProfileService.getUserProfile(uid);
    const merged = { ...(current?.progress ?? defaultProgress), ...progress };
    const { error } = await supabase.from('profiles').update({ progress: merged, updated_at: nowIso() }).eq('id', uid);
    if (error) throw error;
  },
};

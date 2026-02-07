import React, {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from 'react';
import {
  authService,
  userProfileService,
  supabase,
} from '../../../services/supabase';
import type {AuthChangeEvent, Session} from '@supabase/supabase-js';
import {
  User,
  UserProfile,
  AuthContextType,
} from '../interfaces/auth.interface.ts';
import {
  loadProfileFromCache,
  saveProfileToCache,
  clearProfileCache,
} from './profileCache.utils';
import {getErrorMessage} from './authError.utils';

// Create the Authentication Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

// Authentication Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // action-level loading
  const [initialized, setInitialized] = useState<boolean>(false); // initial auth check completed
  const [error, setError] = useState<string | null>(null);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState<
    string | null
  >(null);
  // Note: with Supabase confirm-email requirement, we don't need a registration guard
  const lastUserIdRef = useRef<string | null>(null);

  // Clear error function
  const clearError = () => setError(null);

  // Handle authentication state changes (Supabase)
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        clearError();
        const {data, error} = await supabase.auth.getSession();
        if (error) throw error;
        const session = data?.session ?? null;
        const sUser = session?.user ?? null;
        if (sUser && mounted) {
          console.debug('[Auth] Session found on init for', sUser.email);
          const appUser: User = {
            uid: sUser.id,
            email: sUser.email ?? null,
            displayName: (sUser.user_metadata?.displayName as string) || null,
          };
          setUser(appUser);
          lastUserIdRef.current = appUser.uid;

          // 1) Try hydrate from cache immediately for fast paint
          const cached = loadProfileFromCache(sUser.id);
          if (cached) {
            setUserProfile(cached);
          }

          // 2) Kick off background refresh from DB (non-blocking)
          void (async () => {
            try {
              const fresh = await userProfileService.getUserProfile(sUser.id);
              if (mounted) {
                setUserProfile(fresh);
                saveProfileToCache(sUser.id, fresh);
                setEmailVerificationRequired(null);
              }
            } catch (e) {
              console.warn('[Auth] Failed to refresh profile in background', e);
            }
          })();
        } else if (mounted) {
          console.debug('[Auth] No session on init');
          setUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.error('Initial auth session load error:', err);
        if (mounted) {
          setError('Failed to load user data');
          setUser(null);
          setUserProfile(null);
        }
      } finally {
        if (mounted) setInitialized(true); // do not wait for profile refresh
      }
    };

    void init();

    // Failsafe: ensure initialized is set even if getSession hangs (extensions, blocked storage, etc.)
    const failsafe = setTimeout(() => {
      if (mounted) {
        console.warn(
          '[Auth] Init failsafe triggered; forcing initialized=true',
        );
        setInitialized(true);
      }
    }, 3000);

    const {data: sub} = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        try {
          if (!mounted) return;
          clearError();
          const sUser = session?.user ?? null;
          if (sUser) {
            console.debug('[Auth] onAuthStateChange user present', sUser.email);
            const appUser: User = {
              uid: sUser.id,
              email: sUser.email ?? null,
              displayName: (sUser.user_metadata?.displayName as string) || null,
            };
            setUser(appUser);
            lastUserIdRef.current = appUser.uid;

            // Try cached profile first for instant UI
            const cached = loadProfileFromCache(sUser.id);
            if (cached) setUserProfile(cached);

            // Refresh in background
            void (async () => {
              try {
                const fresh = await userProfileService.getUserProfile(sUser.id);
                if (mounted) {
                  setUserProfile(fresh);
                  saveProfileToCache(sUser.id, fresh);
                  setEmailVerificationRequired(null);
                }
              } catch (e) {
                console.warn('[Auth] Failed to refresh profile (listener)', e);
              }
            })();
          } else {
            console.debug('[Auth] onAuthStateChange no user');
            // Attempt to clear previous cache entry
            clearProfileCache(lastUserIdRef.current);
            setUser(null);
            setUserProfile(null);
          }
        } catch (err) {
          console.error('Auth state change error:', err);
          if (mounted) setError('Failed to load user data');
        } finally {
          // passive listener
        }
      },
    );

    return () => {
      mounted = false;
      clearTimeout(failsafe);
      sub.subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      clearError();
      await authService.signIn(email, password);
      // Note: If email is not verified, the onAuthStateChanged will handle logout
    } catch (err: unknown) {
      console.error('Sign in error:', err);
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    matrikelnummer: string,
    gamertag: string,
  ): Promise<void> => {
    try {
      setLoading(true);
      clearError();
      // Registration triggers an email; no session until confirmed (depending on project settings)
      await authService.signUp(
        email,
        password,
        displayName,
        matrikelnummer,
        gamertag,
      );
      // Inform UI to show verification modal
      setEmailVerificationRequired(email);
    } catch (err: unknown) {
      console.error('Sign up error:', err);
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      clearError();
      // clear cached profile for current user
      clearProfileCache(user?.uid ?? null);
      await authService.signOut();
    } catch (err: unknown) {
      console.error('Sign out error:', err);
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string): Promise<void> => {
    try {
      clearError();
      await authService.resetPassword(email);
    } catch (err: unknown) {
      console.error('Reset password error:', err);
      setError(getErrorMessage(err));
      throw err;
    }
  };

  // Resend email verification function
  const resendEmailVerification = async (email: string): Promise<void> => {
    try {
      setLoading(true);
      clearError();
      await authService.resendEmailVerification(email);
    } catch (err: unknown) {
      console.error('Resend verification error:', err);
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    try {
      clearError();
      if (!user) throw new Error('No user logged in');

      await authService.updateUserProfile(user.uid, data);

      // Update local state
      if (userProfile) {
        const updated = {...userProfile, ...data} as UserProfile;
        setUserProfile(updated);
        saveProfileToCache(user.uid, updated);
      }
    } catch (err: unknown) {
      console.error('Update profile error:', err);
      setError(getErrorMessage(err));
      throw err;
    }
  };

  // Clear email verification requirement
  const clearEmailVerificationRequired = () =>
    setEmailVerificationRequired(null);

  // Context value
  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    initialized,
    error,
    emailVerificationRequired,
    signIn,
    signUp,
    signOut,
    resetPassword,
    resendEmailVerification,
    updateProfile,
    clearEmailVerificationRequired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export AuthContext for use in hooks
export {AuthContext};

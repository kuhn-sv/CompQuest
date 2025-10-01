import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { authService, userProfileService, supabase } from '../../services/supabase';
import { User, UserProfile, AuthContextType } from '../../types/auth.types';

// Create the Authentication Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

// Authentication Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState<string | null>(null);
  // Note: with Supabase confirm-email requirement, we don't need a registration guard

  // Clear error function
  const clearError = () => setError(null);

  // Handle authentication state changes (Supabase)
  useEffect(() => {
    setLoading(true);
    // Initial fetch of current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      try {
        clearError();
        const sUser = session?.user ?? null;
        if (sUser) {
          const appUser: User = {
            uid: sUser.id,
            email: sUser.email ?? null,
            displayName: (sUser.user_metadata?.displayName as string) || null,
          };
          setUser(appUser);
          const profile = await userProfileService.getUserProfile(sUser.id);
          setUserProfile(profile);
          setEmailVerificationRequired(null);
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } finally {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setLoading(true);
        clearError();
        const sUser = session?.user ?? null;
        if (sUser) {
          // If project requires email confirmation, unconfirmed users won't have a session here
          const appUser: User = {
            uid: sUser.id,
            email: sUser.email ?? null,
            displayName: (sUser.user_metadata?.displayName as string) || null,
          };
          setUser(appUser);
          const profile = await userProfileService.getUserProfile(sUser.id);
          setUserProfile(profile);
          setEmailVerificationRequired(null);
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    });

    return () => {
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
  const signUp = async (email: string, password: string, displayName: string, matrikelnummer: string): Promise<void> => {
    try {
      setLoading(true);
      clearError();
      // Registration triggers an email; no session until confirmed (depending on project settings)
      await authService.signUp(email, password, displayName, matrikelnummer);
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
        setUserProfile({ ...userProfile, ...data });
      }
    } catch (err: unknown) {
      console.error('Update profile error:', err);
      setError(getErrorMessage(err));
      throw err;
    }
  };

  // Clear email verification requirement
  const clearEmailVerificationRequired = () => setEmailVerificationRequired(null);

  // Context value
  const value: AuthContextType = {
    user,
    userProfile,
    loading,
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export AuthContext for use in hooks
export { AuthContext };

// Helper function to get user-friendly error messages
const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'code' in error) {
    const e = error as { code: string; message: string };
    switch (e.code) {
      case 'invalid_credentials':
      case 'auth/invalid-credentials':
        return 'E-Mail oder Passwort ist falsch.';
      case 'user_not_found':
        return 'Kein Benutzer mit dieser E-Mail-Adresse gefunden.';
      case 'email_exists':
      case 'auth/email-already-in-use':
        return 'Diese E-Mail-Adresse wird bereits verwendet.';
      case 'weak_password':
      case 'auth/weak-password':
        return 'Das Passwort ist zu schwach.';
      case 'invalid_email':
      case 'auth/invalid-email':
        return 'Ungültige E-Mail-Adresse.';
      case 'too_many_requests':
      case 'auth/too-many-requests':
        return 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.';
      default:
        return `Authentifizierungsfehler: ${e.message}`;
    }
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as { message: string }).message;
  }
  return 'Ein unbekannter Fehler ist aufgetreten.';
};
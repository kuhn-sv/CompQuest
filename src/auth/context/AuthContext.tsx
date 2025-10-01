import React, { createContext, useEffect, useState, ReactNode, useRef } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, authService, userProfileService } from '../../services/firebase';
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
  // Guard to suppress auto sign-out while registration flow is creating Firestore profile
  const isRegisteringRef = useRef<boolean>(false);

  // Clear error function
  const clearError = () => setError(null);

  // Handle authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        setLoading(true);
        clearError();

        if (firebaseUser) {
          // Check if email is verified
          if (!firebaseUser.emailVerified) {
            // If email is not verified, store the email for verification modal
            console.log('Email not verified for user:', firebaseUser.email);
            setEmailVerificationRequired(firebaseUser.email || '');
            // During registration we need to keep the session briefly so the profile can be written
            if (!isRegisteringRef.current) {
              await authService.signOut();
              setUser(null);
              setUserProfile(null);
            }
            return;
          }

          // Clear email verification requirement if user is now verified
          setEmailVerificationRequired(null);

          // User is signed in and email is verified
          const user: User = {
            ...firebaseUser,
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            uid: firebaseUser.uid
          };
          
          setUser(user);

          // Fetch user profile from Firestore
          const profile = await userProfileService.getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } else {
          // User is signed out
          setUser(null);
          setUserProfile(null);
          // Keep emailVerificationRequired if user was just signed out due to unverified email
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
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
      // Mark that we're in the registration flow to avoid premature sign-out in the listener
      isRegisteringRef.current = true;
      await authService.signUp(email, password, displayName, matrikelnummer);
    } catch (err: unknown) {
      console.error('Sign up error:', err);
      setError(getErrorMessage(err));
      throw err;
    } finally {
      isRegisteringRef.current = false;
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
    const firebaseError = error as { code: string; message: string };
    switch (firebaseError.code) {
      case 'auth/user-not-found':
        return 'Kein Benutzer mit dieser E-Mail-Adresse gefunden.';
      case 'auth/wrong-password':
        return 'Falsches Passwort.';
      case 'auth/email-already-in-use':
        return 'Diese E-Mail-Adresse wird bereits verwendet.';
      case 'auth/weak-password':
        return 'Das Passwort ist zu schwach.';
      case 'auth/invalid-email':
        return 'Ungültige E-Mail-Adresse.';
      case 'auth/too-many-requests':
        return 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.';
      case 'auth/network-request-failed':
        return 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.';
      default:
        return `Authentifizierungsfehler: ${firebaseError.message}`;
    }
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as { message: string }).message;
  }
  return 'Ein unbekannter Fehler ist aufgetreten.';
};
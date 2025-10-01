import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from './config';
type ErrorWithCode = Error & { code?: string };
import { UserProfile, UserPreferences, UserProgress } from '../../types/auth.types';

// Authentication Services
export const authService = {
  // Sign up new user
  signUp: async (email: string, password: string, displayName: string, matrikelnummer: string): Promise<UserCredential> => {
    try {
      console.log('Starting user registration for:', email);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Firebase user created:', userCredential.user.uid);
      
      // Update the user's display name
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      console.log('Display name updated');

      // Send email verification with action settings
      const actionCodeSettings = {
        // Use the app's origin; ensure this domain is configured as an authorized domain in Firebase Auth
        url: `${window.location.origin}/auth/login`,
        handleCodeInApp: true
      };
      await sendEmailVerification(userCredential.user, actionCodeSettings);
      console.log('Email verification sent to:', email);

      // Create user profile in Firestore
      await createUserProfile(userCredential.user, displayName, matrikelnummer);
      console.log('User profile created in Firestore');
      
      // Enforce email verification by signing the user out after profile creation
      // Auth listener/UI will prompt the user to verify their email
      await signOut(auth);
      
      // Note: The AuthContext will automatically sign out the user if email is not verified
      
      return userCredential;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  // Sign in existing user
  signIn: async (email: string, password: string): Promise<UserCredential> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last login time (only if email is verified - handled by AuthContext)
    if (userCredential.user.emailVerified) {
      await updateUserLastLogin(userCredential.user.uid);
    }
    
    return userCredential;
  },

  // Sign out user
  signOut: async (): Promise<void> => {
    await signOut(auth);
  },

  // Reset password
  resetPassword: async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  },

  // Resend email verification
  resendEmailVerification: async (email: string): Promise<void> => {
    // Client-side rate limit: max 3 per hour per email
    const limit = 3;
    const windowMs = 60 * 60 * 1000; // 1 hour
    const now = Date.now();
    const key = `resend_verification:${email.toLowerCase()}`;
    try {
      const raw = localStorage.getItem(key);
      const timestamps: number[] = raw ? JSON.parse(raw) : [];
      const recent = timestamps.filter((t) => now - t < windowMs);
      if (recent.length >= limit) {
        const minutesLeft = Math.ceil((windowMs - (now - recent[0])) / 60000);
  const err: ErrorWithCode = new Error(`Zu viele Anfragen. Bitte versuche es in ${minutesLeft} Minuten erneut.`);
  // Attach a code similar to Firebase for UI handling
  err.code = 'resend/too-many-requests';
        throw err;
      }

      // Preferred path: if user is currently authenticated and matches email
      if (auth.currentUser && auth.currentUser.email === email) {
        const actionCodeSettings = {
          url: `${window.location.origin}/auth/login`,
          handleCodeInApp: true
        };
        await sendEmailVerification(auth.currentUser, actionCodeSettings);
      } else {
        // Fallback: call backend function that generates and sends verification link
        const fnUrl = import.meta.env.VITE_VERIFICATION_FUNCTION_URL;
        if (!fnUrl) {
          const err: ErrorWithCode = new Error('E-Mail kann nicht gesendet werden: Server-Endpunkt nicht konfiguriert. Bitte Admin kontaktieren.');
          err.code = 'resend/not-configured';
          throw err;
        }

        const resp = await fetch(fnUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, redirectUrl: `${window.location.origin}/auth/login` })
        });
        if (!resp.ok) {
          const text = await resp.text().catch(() => '');
          const err: ErrorWithCode = new Error(`Server-Fehler beim Senden der E-Mail (${resp.status}): ${text || 'Unbekannter Fehler'}`);
          err.code = 'resend/server-error';
          throw err;
        }
      }

      // Update rate-limit window
      recent.push(now);
      localStorage.setItem(key, JSON.stringify(recent));
    } catch (e) {
      throw e;
    }
  },

  // Update user profile
  updateUserProfile: async (uid: string, data: Partial<UserProfile>): Promise<void> => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  }
};

// Firestore User Profile Services
export const userProfileService = {
  // Get user profile from Firestore
  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },

  // Update user preferences
  updatePreferences: async (uid: string, preferences: Partial<UserPreferences>): Promise<void> => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      preferences,
      updatedAt: serverTimestamp()
    });
  },

  // Update user progress
  updateProgress: async (uid: string, progress: Partial<UserProgress>): Promise<void> => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      progress,
      updatedAt: serverTimestamp()
    });
  }
};

// Helper function to create user profile in Firestore
const createUserProfile = async (user: FirebaseUser, displayName: string, matrikelnummer: string): Promise<void> => {
  try {
    console.log('Creating user profile for:', user.uid);
    console.log('User auth state:', {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified
    });
    
    const defaultPreferences: UserPreferences = {
      theme: 'auto',
      language: 'de',
      notifications: {
        email: true,
        achievements: true,
        reminders: false
      }
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
        lastActivity: new Date().toISOString()
      }
    };

    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: displayName,
      matrikelnummer: matrikelnummer,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      preferences: defaultPreferences,
      progress: defaultProgress
    };

    console.log('User profile data:', JSON.stringify(userProfile, null, 2));
    console.log('Attempting to write to Firestore path:', `users/${user.uid}`);

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, userProfile);
    
    console.log('✅ User profile created successfully');
  } catch (error) {
    console.error('❌ Error creating user profile:', error);
    
    // Zusätzliche Firestore-spezifische Fehleranalyse
    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        console.error('🚨 FIRESTORE PERMISSION ERROR:');
        console.error('   - Überprüfen Sie die Firestore Database Rules');
        console.error('   - Aktuell blockieren die Regeln Schreibzugriffe');
        console.error('   - Gehen Sie zur Firebase Console → Firestore → Rules');
      }
    }
    
    throw error;
  }
};

// Helper function to update last login time
const updateUserLastLogin = async (uid: string): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    lastLoginAt: new Date().toISOString(),
    updatedAt: serverTimestamp()
  });
};
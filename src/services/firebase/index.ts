// Firebase configuration and initialization
export { default as app, auth, db, storage } from './config';

// Authentication services
export { authService, userProfileService } from './auth.service';

// Re-export Firebase types for convenience
export type { User } from 'firebase/auth';
export type { DocumentData, Timestamp } from 'firebase/firestore';
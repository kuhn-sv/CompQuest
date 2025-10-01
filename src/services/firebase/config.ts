import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Debug: Log Firebase configuration (ohne sensitive Daten)
console.log('Firebase Config Debug:', {
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'MISSING',
  authDomain: firebaseConfig.authDomain || 'MISSING',
  projectId: firebaseConfig.projectId || 'MISSING',
  storageBucket: firebaseConfig.storageBucket || 'MISSING',
  messagingSenderId: firebaseConfig.messagingSenderId || 'MISSING',
  appId: firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 15)}...` : 'MISSING'
});

// Validierung der wichtigsten Konfigurationswerte
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your-api-key-here') {
  console.error('❌ Firebase API Key ist nicht konfiguriert! Bitte .env.local überprüfen.');
}
if (!firebaseConfig.projectId || firebaseConfig.projectId === 'your-project-id') {
  console.error('❌ Firebase Project ID ist nicht konfiguriert! Bitte .env.local überprüfen.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Use device/browser language for Auth flows and emails (falls back to 'de' via app settings)
try {
  auth.useDeviceLanguage();
} catch (e) {
  console.warn('Auth language setup failed (non-fatal):', e);
}

export default app;
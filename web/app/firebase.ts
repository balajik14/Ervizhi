/**
 * Firebase Client SDK Configuration
 * ===================================
 * Initialises Firebase Auth, Firestore, and Storage for the Expo frontend.
 *
 * IMPORTANT: Replace the placeholder values below with your actual
 * Firebase project config from Firebase Console → Project Settings → General.
 * These are PUBLIC client-side keys and are safe to ship in the app bundle.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth,
  initializeAuth,
  GoogleAuthProvider,
} from 'firebase/auth';
// @ts-ignore
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ─── Firebase Config ────────────────────────────────────────────────
// Replace these with your Firebase project values
const firebaseConfig = {
  apiKey: "AIzaSyAcHiDjb92TgSMLfELwUUxvdOErQ6f729c",
  authDomain: "ervizhi.firebaseapp.com",
  projectId: "ervizhi",
  storageBucket: "ervizhi.firebasestorage.app",
  messagingSenderId: "930204309744",
  appId: "1:930204309744:web:985ebba657b74b6f564a35"
};

// ─── Initialise Firebase App (singleton) ────────────────────────────
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ─── Auth with persistence ──────────────────────────────────────────
// On native platforms, use AsyncStorage for persistent auth state.
// On web, Firebase handles persistence automatically.
let auth: ReturnType<typeof getAuth>;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (e) {
    // If already initialised (hot reload), just get the existing instance
    auth = getAuth(app);
  }
}

// ─── Firestore ──────────────────────────────────────────────────────
const firestore = getFirestore(app);

// ─── Storage ────────────────────────────────────────────────────────
const storage = getStorage(app);

// ─── Google Auth Provider ───────────────────────────────────────────
const googleProvider = new GoogleAuthProvider();

export { app, auth, firestore, storage, googleProvider };
export default app;

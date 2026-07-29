/**
 * API Configuration & Reusable Client
 * =====================================
 * Provides API_BASE_URL, fetchWithTimeout with auto-auth,
 * and an authFetch helper that attaches Firebase ID tokens.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebase';

// ─── Base URL ───────────────────────────────────────────────────────
// For production: set "extra.apiBaseUrl" in app.json or app.config.js
// For development: auto-detects local IP from Expo debugger host
const PRODUCTION_API_URL = Constants.expoConfig?.extra?.apiBaseUrl as string | undefined;
const debuggerHost = Constants.expoConfig?.hostUri;
const localIp = debuggerHost?.split(':')[0] || '10.54.160.113';
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || process.env.VITE_API_BASE_URL || PRODUCTION_API_URL || 'https://ervizhi.onrender.com/api';

// ─── Get current auth token (Firebase first, then local fallback) ────
async function getAuthToken(): Promise<string | null> {
  try {
    // Try Firebase auth first (Google sign-in, email/password via Firebase)
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      return await firebaseUser.getIdToken();
    }
  } catch {
    // Firebase unavailable — fall through
  }
  // Fallback: local username/password session token stored in AsyncStorage
  try {
    const localToken = await AsyncStorage.getItem('user_token');
    return localToken ?? null;
  } catch {
    return null;
  }
}

// ─── Fetch with timeout ─────────────────────────────────────────────
/**
 * A robust fetch wrapper with timeout, JSON headers, and detailed error logging.
 * Does NOT auto-attach auth tokens — use authFetch for authenticated requests.
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 30000,
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const finalOptions: RequestInit = {
    ...options,
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  };

  console.log(`[API REQUEST] => ${finalOptions.method || 'GET'} ${url}`);

  try {
    const response = await fetch(url, finalOptions);
    clearTimeout(timeoutId);
    console.log(`[API RESPONSE] <= ${response.status} ${response.statusText}`);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error(`[API ERROR] <= ${url}`, error);

    if (error.name === 'AbortError') {
      throw new Error(
        `Request timed out after ${timeoutMs / 1000} seconds. Please check your network connection and ensure the backend server is running.`,
      );
    } else if (error.message?.includes('Network request failed')) {
      throw new Error(
        `Network error: Cannot reach backend at ${API_BASE_URL}. Ensure your device is on the same network as the server.`,
      );
    }
    throw error;
  }
}

// ─── Authenticated Fetch ────────────────────────────────────────────
/**
 * Like fetchWithTimeout but automatically attaches the Firebase ID token
 * as a Bearer token in the Authorization header.
 */
export async function authFetch(
  url: string,
  options: RequestInit = {},
  timeoutMs = 30000,
) {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetchWithTimeout(url, { ...options, headers }, timeoutMs);
}

export default function Dummy() { return null; }
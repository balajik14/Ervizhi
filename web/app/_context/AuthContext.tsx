import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_BASE_URL, fetchWithTimeout } from '../_api/config';

// Safe storage wrapper to prevent AsyncStorage hanging on Web
const safeStorage = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return window.localStorage.getItem(key);
    }
    return await AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
      return;
    }
    await AsyncStorage.removeItem(key);
  }
};

// ─── Types ──────────────────────────────────────────────────────────
export type UserProfile = {
  uid: string;
  email: string;
  username: string;
  language_pref: string;
  phone: string;
  village?: string;
  profile_image_url: string;
  created_at?: string;
  updated_at?: string;
};

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  token: string | null;
  /** True ONLY during the initial app-start session restore. Never true during login/register. */
  isLoading: boolean;
  isAuthenticated: boolean;
  sendOTP: (email: string) => Promise<string>;
  verifyOtpOnly: (email: string, otp: string) => Promise<void>;
  verifyOTPAndRegister: (email: string, username: string, password: string, otp: string) => Promise<void>;
  resetPasswordWithOTP: (email: string, otp: string, newPassword: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  getToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  sendOTP: async () => "",
  verifyOtpOnly: async () => {},
  verifyOTPAndRegister: async () => {},
  resetPasswordWithOTP: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
  getToken: async () => null,
});

export const useAuth = () => useContext(AuthContext);

// ─── Provider ───────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // isLoading is ONLY true during the very first session restore on app boot.
  const [isLoading, setIsLoading] = useState(true);

  // ── Helper: set authenticated state and persist ──────────────────
  const _setAuth = useCallback(async (tok: string, prof: UserProfile) => {
    setToken(tok);
    setProfile(prof);
    setUser({ uid: prof.uid, email: prof.email } as any);
    await safeStorage.setItem('user_token', tok);
    await safeStorage.setItem('user_profile', JSON.stringify(prof));
  }, []);

  // ── Restore session from AsyncStorage on app boot ─────────────────
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await safeStorage.getItem('user_token');
        const storedProfile = await safeStorage.getItem('user_profile');
        if (storedToken && storedProfile) {
          const parsedProfile: UserProfile = JSON.parse(storedProfile);

          // Verify the token is still valid with the backend
          try {
            const res = await fetchWithTimeout(`${API_BASE_URL}/auth/me`, {
              method: 'GET',
              headers: { Authorization: `Bearer ${storedToken}` },
            }, 8000);

            if (res.ok) {
              // Token valid — restore session
              const freshProfile = await res.json();
              setToken(storedToken);
              setProfile(freshProfile);
              setUser({ uid: parsedProfile.uid, email: parsedProfile.email } as any);
            } else {
              // Token rejected by server — clear stale session
              await safeStorage.removeItem('user_token');
              await safeStorage.removeItem('user_profile');
            }
          } catch {
            // Backend unreachable — restore from local cache so user stays logged in offline
            setToken(storedToken);
            setProfile(parsedProfile);
            setUser({ uid: parsedProfile.uid, email: parsedProfile.email } as any);
          }
        }
      } catch (err) {
        console.error('[AuthProvider] Failed to load stored session:', err);
      } finally {
        // isLoading goes false exactly once — when initial check is done
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  // ── Get token ──────────────────────────────────────────────────
  const getToken = useCallback(async (): Promise<string | null> => token, [token]);

  // ── Local Username/Password Login ──────────────────────────────
  // NOTE: Does NOT touch isLoading — index.tsx manages its own button spinner.
  const loginLocal = useCallback(async (username: string, password: string) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim().toLowerCase(), password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Login failed. Check username and password.');
    }
    await _setAuth(data.token, data.profile);
  }, [_setAuth]);

  
  // ── OTP Methods ─────────────────────────────────────────────
  const sendOTP = useCallback(async (email: string): Promise<string> => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to send OTP.');
    }
    return data.otp; // Only returned if email disabled, otherwise just informational
  }, []);

  const verifyOtpOnly = useCallback(async (email: string, otp: string): Promise<void> => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/verify-otp-only`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Invalid or expired OTP.');
    }
  }, []);

  const verifyOTPAndRegister = useCallback(async (email: string, username: string, password: string, otp: string): Promise<void> => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/verify-otp-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        username: username.trim().toLowerCase(),
        password,
        otp: otp.trim()
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'OTP Verification or Registration failed.');
    }
    await _setAuth(data.token, data.profile);
  }, [_setAuth]);

  const resetPasswordWithOTP = useCallback(async (email: string, otp: string, newPassword: string): Promise<void> => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        new_password: newPassword,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Password reset failed.');
    }
  }, []);

  // ── Compat Fallbacks ────────────────────────────────────────────


  const loginWithGoogle = useCallback(async () => {
    throw new Error('Google sign-in is disabled. Please create a local profile.');
  }, []);

  // ── Logout ──────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setUser(null);
    setProfile(null);
    setToken(null);
    await safeStorage.removeItem('user_token');
    await safeStorage.removeItem('user_profile');
  }, []);

  // ── Refresh Profile ─────────────────────────────────────────────
  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        await safeStorage.setItem('user_profile', JSON.stringify(data));
      }
    } catch (e) {
      console.error('[AuthProvider] Failed to refresh profile:', e);
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        isAuthenticated: !!user,
        loginLocal,
        sendOTP,
        verifyOtpOnly,
        verifyOTPAndRegister,
        resetPasswordWithOTP,
        loginWithGoogle,
        logout,
        refreshProfile,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default function Dummy() { return null; }

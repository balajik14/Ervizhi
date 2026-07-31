import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FloatingLeafLoader from '../components/FloatingLeafLoader';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from './_context/AuthContext';
import { COLORS, RADIUS, SHADOWS, SPACING, GRADIENTS } from '../constants/theme';

export default function VerifyEmailScreen() {
  const { token, email } = useLocalSearchParams();
  const { verifyEmailToken } = useAuth();
  const router = useRouter();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid verification link. Token or email is missing.');
      return;
    }

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Token is missing.');
      return;
    }

    const verify = async () => {
      try {
        await verifyEmailToken(token as string, email as string);
        setStatus('success');
        setMessage('Your account has been successfully verified!');
      } catch (e: any) {
        setStatus('error');
        setMessage(e.message || 'Verification failed. The link may have expired.');
      }
    };

    verify();
  }, [token, email, verifyEmailToken]);

  return (
    <LinearGradient colors={GRADIENTS.heroBg} style={styles.container}>
      <View style={styles.card}>
        {status === 'loading' && (
          <>
            <FloatingLeafLoader size={36} color={COLORS.gold} />
            <Text style={styles.message}>{message}</Text>
          </>
        )}
        
        {status === 'success' && (
          <>
            <MaterialIcons name="check-circle" size={64} color="#10b981" />
            <Text style={[styles.title, { color: '#10b981' }]}>Verified!</Text>
            <Text style={styles.message}>{message}</Text>
            <TouchableOpacity style={styles.button} onPress={() => router.replace('/')}>
              <Text style={styles.buttonText}>Proceed to Login</Text>
            </TouchableOpacity>
          </>
        )}

        {status === 'error' && (
          <>
            <MaterialIcons name="error" size={64} color="#ef4444" />
            <Text style={[styles.title, { color: '#ef4444' }]}>Verification Failed</Text>
            <Text style={styles.message}>{message}</Text>
            <TouchableOpacity style={styles.button} onPress={() => router.replace('/')}>
              <Text style={styles.buttonText}>Back to Home</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(6,95,70,0.8)',
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: COLORS.goldBorderSoft,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  button: {
    backgroundColor: COLORS.gold,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: RADIUS.pill,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkBg,
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import FloatingLeafLoader from '../components/FloatingLeafLoader';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from './_context/AuthContext';
import { COLORS, RADIUS, SHADOWS, SPACING, GRADIENTS } from '../constants/theme';

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams();
  const { resetPasswordLink } = useAuth();
  const router = useRouter();
  
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!token) {
    return (
      <LinearGradient colors={GRADIENTS.heroBg} style={styles.container}>
        <View style={styles.card}>
          <MaterialIcons name="error" size={64} color="#ef4444" />
          <Text style={[styles.title, { color: '#ef4444' }]}>Invalid Link</Text>
          <Text style={styles.message}>Reset token is missing from the URL.</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.replace('/')}>
            <Text style={styles.buttonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const handleReset = async () => {
    if (!newPassword.trim()) {
      setMessage('Please enter a new password.');
      setStatus('error');
      return;
    }
    
    setStatus('loading');
    try {
      await resetPasswordLink(token as string, newPassword);
      setStatus('success');
      setMessage('Your password has been successfully reset!');
    } catch (e: any) {
      setStatus('error');
      setMessage(e.message || 'Password reset failed. The link may have expired.');
    }
  };

  return (
    <LinearGradient colors={GRADIENTS.heroBg} style={styles.container}>
      <View style={styles.card}>
        {status !== 'success' && (
          <>
            <MaterialIcons name="lock-reset" size={64} color={COLORS.gold} />
            <Text style={styles.title}>Reset Password</Text>
            
            {status === 'error' && (
              <View style={styles.errorBox}>
                <MaterialIcons name="error-outline" size={18} color="#ef4444" style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{message}</Text>
              </View>
            )}
            
            <TextInput
              style={styles.input}
              placeholder="Enter new password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholderTextColor={COLORS.textMuted}
              editable={status !== 'loading'}
            />
            
            <TouchableOpacity style={styles.button} onPress={handleReset} disabled={status === 'loading'}>
              {status === 'loading' ? (
                <FloatingLeafLoader color={COLORS.darkBg} size={24} />
              ) : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </>
        )}
        
        {status === 'success' && (
          <>
            <MaterialIcons name="check-circle" size={64} color="#10b981" />
            <Text style={[styles.title, { color: '#10b981' }]}>Password Reset</Text>
            <Text style={styles.message}>{message}</Text>
            <TouchableOpacity style={styles.button} onPress={() => router.replace('/')}>
              <Text style={styles.buttonText}>Proceed to Login</Text>
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
    marginBottom: SPACING.lg,
    color: COLORS.textPrimary,
  },
  message: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(13,59,46,0.6)',
    borderWidth: 1,
    borderColor: COLORS.goldBorderSoft,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 20,
    paddingVertical: 13,
    marginBottom: SPACING.lg,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  button: {
    backgroundColor: COLORS.gold,
    paddingVertical: 15,
    borderRadius: RADIUS.pill,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkBg,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    width: '100%',
  },
  errorText: { color: '#ef4444', fontSize: 13, fontWeight: '600', flex: 1 },
});

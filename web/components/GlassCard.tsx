import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'gold' | 'dark';
}

export default function GlassCard({ children, style, variant = 'default' }: GlassCardProps) {
  const glassStyle = Platform.OS === 'web' ? {
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  } : {};

  let colors = ['rgba(16,185,129,0.15)', 'rgba(6,95,70,0.2)'];
  let borderColor = 'rgba(16,185,129,0.4)';

  if (variant === 'gold') {
    colors = ['rgba(212,175,55,0.15)', 'rgba(212,175,55,0.05)'];
    borderColor = 'rgba(212,175,55,0.4)';
  } else if (variant === 'dark') {
    colors = ['rgba(3,59,45,0.95)', 'rgba(6,46,37,0.98)'];
    borderColor = 'rgba(255,255,255,0.05)';
  }

  return (
    <LinearGradient
      colors={colors as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { borderColor }, glassStyle as any, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
});

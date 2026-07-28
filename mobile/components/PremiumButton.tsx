import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, ViewStyle, TextStyle, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING, GRADIENTS } from '../constants/theme';

interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export default function PremiumButton({ title, onPress, variant = 'primary', style, textStyle, icon, disabled }: PremiumButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
  };

  const isOutline = variant === 'outline';
  
  let colors: any = GRADIENTS.gold;
  if (variant === 'secondary') colors = GRADIENTS.emerald;
  if (variant === 'danger') colors = ['#EF4444', '#B91C1C'] as any;
  if (isOutline || disabled) colors = ['transparent', 'transparent'] as any;
  if (disabled) colors = ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] as any;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={disabled ? undefined : onPress}
      onPressIn={disabled ? undefined : handlePressIn}
      onPressOut={disabled ? undefined : handlePressOut}
      style={[{ width: '100%' }, style]}
    >
      <Animated.View style={[{ transform: [{ scale }] }]}>
        {Platform.OS === 'web' && variant === 'primary' && !disabled && (
          <style dangerouslySetInnerHTML={{__html: `
            .btn-hover-${title.replace(/\s+/g, '')} {
              transition: all 0.3s ease;
            }
            .btn-hover-${title.replace(/\s+/g, '')}:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 20px rgba(212, 175, 55, 0.4);
            }
          `}} />
        )}
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.button,
            isOutline && styles.buttonOutline,
            disabled && styles.buttonDisabled,
            Platform.OS === 'web' && variant === 'primary' && !disabled ? { className: `btn-hover-${title.replace(/\s+/g, '')}` } as any : {}
          ]}
        >
          {icon}
          <Text style={[
            styles.text,
            isOutline && styles.textOutline,
            variant === 'secondary' && styles.textSecondary,
            disabled && styles.textDisabled,
            textStyle
          ]}>
            {title}
          </Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  buttonOutline: {
    borderWidth: 2,
    borderColor: COLORS.gold,
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    color: '#033B2D', // Dark text on gold
    letterSpacing: 0.5,
  },
  textSecondary: {
    color: '#FFFFFF',
  },
  textOutline: {
    color: COLORS.gold,
  },
  textDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },
});

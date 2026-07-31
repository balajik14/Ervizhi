import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Platform, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface FloatingLeafLoaderProps {
  color?: string;
  size?: number;
  style?: any;
}

export default function FloatingLeafLoader({ color = COLORS.gold, size = 26, style }: FloatingLeafLoaderProps) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        })
      ])
    ).start();
  }, [floatAnim]);

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
        <Ionicons name="leaf" size={size} color={color} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  }
});

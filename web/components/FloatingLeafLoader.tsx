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
  const rotateAnim = useRef(new Animated.Value(0)).current;

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

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      })
    ).start();
  }, [floatAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.spinner, { borderColor: color + '40', borderTopColor: color, width: size * 1.8, height: size * 1.8, borderRadius: size * 0.9, transform: [{ rotate: spin }] }]} />
      <Animated.View style={{ position: 'absolute', transform: [{ translateY: floatAnim }] }}>
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
  },
  spinner: {
    position: 'absolute',
    borderWidth: 3,
  }
});

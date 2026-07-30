import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Platform, Easing } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface LeafLoaderProps {
  color?: string;
  size?: number;
  style?: any;
}

export default function LeafLoader({ color = COLORS.gold, size = 28, style }: LeafLoaderProps) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const swingAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Floating up and down
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();

    // 2. Swinging left and right
    Animated.loop(
      Animated.sequence([
        Animated.timing(swingAnim, {
          toValue: 6,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(swingAnim, {
          toValue: -6,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(swingAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();

    // 3. Subtle rotation
    Animated.loop(
      Animated.sequence([
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(spinAnim, {
          toValue: -1,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(spinAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();
  }, [floatAnim, swingAnim, spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '15deg'],
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.leafContainer,
          {
            transform: [
              { translateY: floatAnim },
              { translateX: swingAnim },
              { rotate: spin },
            ],
          },
        ]}
      >
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
  leafContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

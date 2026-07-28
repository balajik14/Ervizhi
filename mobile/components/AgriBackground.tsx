import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const AnimatedDoodle = ({ children, style, duration = 10000, delay = 0, type = 'float' }: any) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(animValue, {
          toValue: 1,
          duration: duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const animatedStyle = type === 'float' ? {
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -30],
        }),
      },
      {
        rotate: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '15deg'],
        }),
      }
    ]
  } : type === 'pulse' ? {
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.2],
        }),
      },
    ],
    opacity: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.8],
    })
  } : {
    transform: [
      {
        rotate: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      }
    ]
  };

  return (
    <Animated.View style={[styles.doodle, style, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

export default function AgriBackground() {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Layer 1: Base Dark Emerald Background */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: COLORS.darkBg }]} />

      {/* Layer 2: Subtle Ambient Radial Glows */}
      <LinearGradient
        colors={['rgba(13,75,56,0.6)', 'rgba(6,46,37,0.95)', '#062E25']}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.9, y: 0.9 }}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={['rgba(212,175,55,0.06)', 'transparent']}
        start={{ x: 0.8, y: 0.1 }}
        end={{ x: 0.2, y: 0.6 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Layer 3: Rich Floating Doodles */}
      <AnimatedDoodle delay={0} duration={8000} type="float" style={{ top: '10%', left: '15%' }}>
        <Ionicons name="leaf-outline" size={24} color="rgba(16,185,129,0.15)" />
      </AnimatedDoodle>
      <AnimatedDoodle delay={2000} duration={12000} type="float" style={{ top: '30%', right: '10%' }}>
        <Ionicons name="water-outline" size={32} color="rgba(59,130,246,0.1)" />
      </AnimatedDoodle>
      <AnimatedDoodle delay={1000} duration={9000} type="pulse" style={{ top: '60%', left: '8%' }}>
        <MaterialIcons name="eco" size={40} color="rgba(16,185,129,0.08)" />
      </AnimatedDoodle>
      <AnimatedDoodle delay={3000} duration={15000} type="float" style={{ top: '80%', right: '20%' }}>
        <Ionicons name="leaf" size={20} color="rgba(212,175,55,0.1)" />
      </AnimatedDoodle>
      <AnimatedDoodle delay={500} duration={11000} type="float" style={{ top: '45%', left: '40%' }}>
        <FontAwesome5 name="seedling" size={28} color="rgba(16,185,129,0.12)" />
      </AnimatedDoodle>
      <AnimatedDoodle delay={1500} duration={10000} type="pulse" style={{ top: '20%', right: '35%' }}>
        <Ionicons name="star-outline" size={16} color="rgba(212,175,55,0.15)" />
      </AnimatedDoodle>
      <AnimatedDoodle delay={2500} duration={14000} type="float" style={{ top: '75%', left: '30%' }}>
        <Ionicons name="sunny-outline" size={36} color="rgba(245,158,11,0.08)" />
      </AnimatedDoodle>
      <AnimatedDoodle delay={4000} duration={13000} type="float" style={{ top: '15%', left: '60%' }}>
        <Ionicons name="leaf-outline" size={22} color="rgba(16,185,129,0.15)" />
      </AnimatedDoodle>
      
      {/* Additional Gold Particles */}
      <AnimatedDoodle delay={800} duration={7000} type="pulse" style={{ top: '5%', right: '50%' }}>
        <Ionicons name="sparkles" size={12} color="rgba(212,175,55,0.2)" />
      </AnimatedDoodle>
      <AnimatedDoodle delay={1200} duration={8500} type="float" style={{ top: '85%', left: '50%' }}>
        <Ionicons name="sparkles-outline" size={14} color="rgba(212,175,55,0.18)" />
      </AnimatedDoodle>
      <AnimatedDoodle delay={3200} duration={16000} type="float" style={{ top: '55%', right: '5%' }}>
        <Ionicons name="leaf" size={18} color="rgba(16,185,129,0.12)" />
      </AnimatedDoodle>
      <AnimatedDoodle delay={2800} duration={9500} type="pulse" style={{ top: '40%', left: '80%' }}>
        <Ionicons name="sparkles" size={10} color="rgba(212,175,55,0.25)" />
      </AnimatedDoodle>
      <AnimatedDoodle delay={4500} duration={12000} type="float" style={{ top: '25%', left: '5%' }}>
        <Ionicons name="water" size={18} color="rgba(59,130,246,0.08)" />
      </AnimatedDoodle>
      <AnimatedDoodle delay={5000} duration={10000} type="float" style={{ top: '90%', right: '40%' }}>
        <Ionicons name="sparkles" size={16} color="rgba(212,175,55,0.2)" />
      </AnimatedDoodle>

      {/* Extra Doodles for High Density */}
      <AnimatedDoodle delay={6000} duration={14000} type="float" style={{ top: '10%', right: '25%' }}>
        <MaterialIcons name="local-florist" size={24} color="rgba(16,185,129,0.15)" />
      </AnimatedDoodle>
      <AnimatedDoodle delay={1800} duration={11500} type="pulse" style={{ top: '35%', left: '15%' }}>
        <FontAwesome5 name="tractor" size={18} color="rgba(212,175,55,0.12)" />
      </AnimatedDoodle>
      <AnimatedDoodle delay={7500} duration={13500} type="float" style={{ top: '65%', right: '7%' }}>
        <Ionicons name="water" size={24} color="rgba(59,130,246,0.1)" />
      </AnimatedDoodle>
      <AnimatedDoodle delay={3500} duration={15500} type="float" style={{ top: '85%', left: '10%' }}>
        <MaterialIcons name="agriculture" size={28} color="rgba(16,185,129,0.1)" />
      </AnimatedDoodle>
      <AnimatedDoodle delay={5500} duration={9000} type="pulse" style={{ top: '25%', right: '65%' }}>
        <Ionicons name="sunny" size={20} color="rgba(245,158,11,0.1)" />
      </AnimatedDoodle>
      <AnimatedDoodle delay={8500} duration={10500} type="float" style={{ top: '75%', right: '35%' }}>
        <FontAwesome5 name="leaf" size={22} color="rgba(16,185,129,0.15)" />
      </AnimatedDoodle>
      <AnimatedDoodle delay={4200} duration={12000} type="pulse" style={{ top: '50%', left: '60%' }}>
        <Ionicons name="star" size={14} color="rgba(212,175,55,0.2)" />
      </AnimatedDoodle>
      <AnimatedDoodle delay={2100} duration={14500} type="float" style={{ top: '15%', right: '85%' }}>
        <MaterialIcons name="nature" size={32} color="rgba(16,185,129,0.1)" />
      </AnimatedDoodle>
      <AnimatedDoodle delay={6800} duration={13000} type="float" style={{ top: '95%', left: '75%' }}>
        <Ionicons name="sparkles" size={18} color="rgba(212,175,55,0.25)" />
      </AnimatedDoodle>

      {/* Layer 4: Abstract Overlays */}
      <View style={[styles.abstractCircle, { top: -100, right: -100, width: 300, height: 300 }]} />
      <View style={[styles.abstractCircle, { bottom: -150, left: -50, width: 400, height: 400 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  doodle: {
    position: 'absolute',
  },
  abstractCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(16,185,129,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.05)',
  }
});

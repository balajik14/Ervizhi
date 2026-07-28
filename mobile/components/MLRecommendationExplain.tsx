import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface MLRecommendationExplainProps {
  cropName: string;
  ancientBenefitHighlight?: string;
  conditions: {
    soilPh: string;
    rainfall: string;
    temperature: string;
    waterAvail: string;
    marketTrend: string;
  };
}

export default function MLRecommendationExplain({ cropName, ancientBenefitHighlight, conditions }: MLRecommendationExplainProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, [cropName]);

  const glassStyle = Platform.OS === 'web' ? {
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  } : {};

  return (
    <Animated.View style={[styles.containerWrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {Platform.OS === 'web' && (
        <style dangerouslySetInnerHTML={{__html: `
          .ml-card-hover {
            transition: all 0.4s ease;
            border-radius: 24px;
          }
          .ml-card-hover:hover {
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.2);
            border-color: rgba(212, 175, 55, 0.6);
            transform: translateY(-2px);
          }
        `}} />
      )}
      <View style={Platform.OS === 'web' ? { className: 'ml-card-hover' } as any : {}}>
        <LinearGradient
          colors={['rgba(3,53,33,0.7)', 'rgba(6,46,37,0.9)']}
          style={[styles.container, glassStyle as any]}
        >
          <View style={styles.header}>
            <View style={styles.iconPulse}>
              <Ionicons name="hardware-chip-outline" size={24} color={COLORS.gold} />
            </View>
            <Text style={styles.title}>Why Choose {cropName}</Text>
          </View>

          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Ionicons name="earth" size={14} color="#9CA3AF" style={{ marginBottom: 4 }} />
              <Text style={styles.label}>Soil pH</Text>
              <Text style={styles.value}>{conditions.soilPh}</Text>
            </View>
            <View style={styles.gridItem}>
              <Ionicons name="rainy-outline" size={14} color="#9CA3AF" style={{ marginBottom: 4 }} />
              <Text style={styles.label}>Rainfall</Text>
              <Text style={styles.value}>{conditions.rainfall}</Text>
            </View>
            <View style={styles.gridItem}>
              <Ionicons name="thermometer-outline" size={14} color="#9CA3AF" style={{ marginBottom: 4 }} />
              <Text style={styles.label}>Temperature</Text>
              <Text style={styles.value}>{conditions.temperature}</Text>
            </View>
            <View style={styles.gridItem}>
              <Ionicons name="water-outline" size={14} color="#9CA3AF" style={{ marginBottom: 4 }} />
              <Text style={styles.label}>Water</Text>
              <Text style={styles.value}>{conditions.waterAvail}</Text>
            </View>
            <View style={styles.gridItemFull}>
              <View>
                <Text style={styles.label}>Market Trend</Text>
                <Text style={styles.valueTrend}>{conditions.marketTrend}</Text>
              </View>
              <Ionicons name="trending-up" size={24} color="#10B981" />
            </View>
          </View>

          {ancientBenefitHighlight && (
            <View style={styles.benefitBox}>
              <Ionicons name="medkit" size={18} color="#10B981" />
              <Text style={styles.benefitText}>{ancientBenefitHighlight}</Text>
            </View>
          )}
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    marginTop: SPACING.md,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  container: {
    borderRadius: 24,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: SPACING.sm,
  },
  iconPulse: {
    backgroundColor: 'rgba(212,175,55,0.1)',
    padding: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textGold,
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '47%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  gridItemFull: {
    width: '100%',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  valueTrend: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
    marginTop: 4,
  },
  benefitBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: SPACING.md,
    borderRadius: 16,
    marginTop: SPACING.lg,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  benefitText: {
    flex: 1,
    fontSize: 13,
    color: '#D1FAE5',
    fontWeight: '600',
    lineHeight: 20,
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useApp } from '../_layout';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import AgriBackground from '../../components/AgriBackground';
import PlanScreen from './plan';
import { useLocalSearchParams } from 'expo-router';
import GrowthScreen from './growth';

export default function FarmScreen() {
  const { isTamil } = useApp();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'plan' | 'growth'>('plan');

  return (
    <LinearGradient
      colors={GRADIENTS.darkBg}
      style={styles.container}
    >
      <AgriBackground />
      {/* Premium Tab Switcher */}
      <View style={styles.tabWrapper}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('plan')}
            activeOpacity={0.8}
          >
            {activeTab === 'plan' ? (
              <LinearGradient
                colors={GRADIENTS.gold}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.activeTab}
              >
                <Text style={[styles.activeTabText, { color: COLORS.textDark }]}>
                  {isTamil ? 'பயிர் திட்டம்' : 'Crop Plan'}
                </Text>
              </LinearGradient>
            ) : (
              <Text style={styles.inactiveTabText}>
                {isTamil ? 'பயிர் திட்டம்' : 'Crop Plan'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('growth')}
            activeOpacity={0.8}
          >
            {activeTab === 'growth' ? (
              <LinearGradient
                colors={GRADIENTS.gold}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.activeTab}
              >
                <Text style={[styles.activeTabText, { color: COLORS.textDark }]}>
                  {isTamil ? 'பயிர் வளர்ச்சி' : 'Crop Growth'}
                </Text>
              </LinearGradient>
            ) : (
              <Text style={styles.inactiveTabText}>
                {isTamil ? 'பயிர் வளர்ச்சி' : 'Crop Growth'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {activeTab === 'plan' ? (
          <PlanScreen initialQuery={params.query as string} />
        ) : (
          <GrowthScreen />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabWrapper: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.pill,
    padding: 4,
    height: 48,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
  },
  activeTab: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.cardBg2,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gold,
  },
  inactiveTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  content: { flex: 1 },
});

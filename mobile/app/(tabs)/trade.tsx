import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useApp } from '../_layout';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import MarketScreen from './market';
import ExportScreen from './export';

export default function TradeScreen() {
  const { isTamil } = useApp();
  const [activeTab, setActiveTab] = useState<'market' | 'export'>('market');

  return (
    <View style={styles.container}>
      {/* Premium Tab Switcher */}
      <View style={styles.tabWrapper}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('market')}
            activeOpacity={0.8}
          >
            {activeTab === 'market' ? (
              <LinearGradient
                colors={GRADIENTS.gold}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.activeTab}
              >
                <Text style={[styles.activeTabText, { color: COLORS.textDark }]}>
                  {isTamil ? 'சந்தை கணிப்பு' : 'Market Forecast'}
                </Text>
              </LinearGradient>
            ) : (
              <Text style={styles.inactiveTabText}>
                {isTamil ? 'சந்தை கணிப்பு' : 'Market Forecast'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('export')}
            activeOpacity={0.8}
          >
            {activeTab === 'export' ? (
              <LinearGradient
                colors={GRADIENTS.gold}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.activeTab}
              >
                <Text style={[styles.activeTabText, { color: COLORS.textDark }]}>
                  {isTamil ? 'ஏற்றுமதி' : 'Export'}
                </Text>
              </LinearGradient>
            ) : (
              <Text style={styles.inactiveTabText}>
                {isTamil ? 'ஏற்றுமதி' : 'Export'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {activeTab === 'market' ? <MarketScreen /> : <ExportScreen />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  tabWrapper: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
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
    color: COLORS.textSecondary,
  },
  content: { flex: 1 },
});

import React, { useRef } from 'react';
import { View, Text, StyleSheet, Platform, Animated, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useApp } from '../app/_layout';

interface HeritageFoodCardProps {
  food: {
    englishName: string;
    tamilName: string;
    siddhaWisdom: string;
    siddhaWisdomTamil?: string;
    siddhaWisdomEnglish?: string;
    nutrientScore: number;
    waterSavings: number;
    profitMargin: string;
    marketDemand: string;
    riskLevel: string;
    seasonalSuitability: { [key: string]: string };
    comparison: {
      giIndex: { ancient: number; modern: number };
      fiber: { ancient: number; modern: number };
      healthImpact: string;
      healthImpactTamil?: string;
      healthImpactEnglish?: string;
    };
    macros?: {
      carbs: number;
      protein: number;
      fat: number;
    };
    sangamReference?: {
      text: string;
      source: string;
      english: string;
    };
  };
}

export default function HeritageFoodCard({ food }: HeritageFoodCardProps) {
  const { isTamil } = useApp();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
  };

  const glassStyle = Platform.OS === 'web' ? {
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  } : {};

  return (
    <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.cardContainer, { transform: [{ scale }] }]}>
        {Platform.OS === 'web' && (
          <style dangerouslySetInnerHTML={{__html: `
            .heritage-card-hover {
              transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            .heritage-card-hover:hover {
              transform: translateY(-8px) scale(1.02);
              box-shadow: 0 15px 30px rgba(212, 175, 55, 0.25), 0 5px 15px rgba(16, 185, 129, 0.2);
            }
          `}} />
        )}
        
        <View style={Platform.OS === 'web' ? { className: 'heritage-card-hover', height: '100%' } as any : { height: '100%' }}>
          <LinearGradient
            colors={['rgba(16,185,129,0.15)', 'rgba(3,53,33,0.85)', 'rgba(6,46,37,0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, glassStyle as any]}
          >
            {/* Floating Glow Accent */}
            <View style={styles.glowAccent} />

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.titleWrap}>
                <Text style={styles.tamilTitle}>{isTamil ? food.tamilName : food.englishName}</Text>
                <Text style={styles.englishTitle}>{isTamil ? food.englishName : food.tamilName}</Text>
              </View>
              <View style={styles.scoreBadge}>
                <LinearGradient
                  colors={['rgba(212,175,55,0.3)', 'rgba(212,175,55,0.05)']}
                  style={StyleSheet.absoluteFillObject}
                />
                <Text style={styles.scoreText}>{food.nutrientScore}</Text>
                <Text style={styles.scoreLabel}>Score</Text>
              </View>
            </View>

            {/* Siddha Wisdom */}
            <View style={styles.siddhaBox}>
              <Ionicons name="leaf" size={18} color={COLORS.gold} style={styles.floatingIcon} />
              <Text style={styles.siddhaText}>{isTamil ? (food.siddhaWisdomTamil || food.siddhaWisdom) : (food.siddhaWisdomEnglish || food.siddhaWisdom)}</Text>
            </View>

            {/* Metrics Row */}
            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>{isTamil ? 'நீர் சேமிப்பு' : 'Water Savings'}</Text>
                <View style={{ flexDirection: 'row', marginTop: 4 }}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < food.waterSavings ? "water" : "water-outline"}
                      size={16}
                      color="#3B82F6"
                    />
                  ))}
                </View>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>{isTamil ? 'சந்தை தேவை' : 'Market Demand'}</Text>
                <Text style={[styles.metricValue, { color: food.marketDemand === 'High' ? COLORS.gold : COLORS.textSecondary }]}>
                  {isTamil ? (food.marketDemand === 'Very High' ? 'மிக அதிகம்' : food.marketDemand === 'High' ? 'அதிகம்' : food.marketDemand === 'Medium' ? 'நடுத்தரம்' : 'குறைவு') : food.marketDemand}
                </Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>{isTamil ? 'லாப வரம்பு' : 'Profit Margin'}</Text>
                <Text style={[styles.metricValue, { color: '#10B981' }]}>{food.profitMargin}</Text>
              </View>
            </View>

            {/* Health Comparison */}
            <View style={styles.comparisonBox}>
              <Text style={styles.comparisonTitle}>{isTamil ? 'நவீன மற்றும் பழங்கால ஆரோக்கியம்' : 'Modern vs Ancient Health'}</Text>
              <View style={styles.compRow}>
                <Text style={styles.compLabel}>{isTamil ? 'GI குறியீடு (குறைவு=நன்று):' : 'GI Index (Lower=Better):'}</Text>
                <Text style={styles.compVal}>{isTamil ? 'நவீனம்' : 'Modern'}: {food.comparison.giIndex.modern} | {isTamil ? 'பழமை' : 'Ancient'}: <Text style={{ color: '#10B981', fontWeight: 'bold' }}>{food.comparison.giIndex.ancient}</Text></Text>
              </View>
              <View style={styles.compRow}>
                <Text style={styles.compLabel}>{isTamil ? 'நார்ச்சத்து (அதிகம்=நன்று):' : 'Fiber (Higher=Better):'}</Text>
                <Text style={styles.compVal}>{isTamil ? 'நவீனம்' : 'Modern'}: {food.comparison.fiber.modern}g | {isTamil ? 'பழமை' : 'Ancient'}: <Text style={{ color: '#10B981', fontWeight: 'bold' }}>{food.comparison.fiber.ancient}g</Text></Text>
              </View>
              <Text style={styles.healthImpact}>{isTamil ? (food.comparison.healthImpactTamil || food.comparison.healthImpact) : (food.comparison.healthImpactEnglish || food.comparison.healthImpact)}</Text>
            </View>

            {/* Macros (if available) */}
            {food.macros && (
              <View style={styles.macrosBox}>
                <Text style={styles.macrosTitle}>{isTamil ? 'ஊட்டச்சத்துகள் (100g)' : 'Macros (100g)'}</Text>
                <View style={styles.macrosRow}>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroVal}>{food.macros.carbs}g</Text>
                    <Text style={styles.macroLabel}>{isTamil ? 'கார்போ' : 'Carbs'}</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroVal}>{food.macros.protein}g</Text>
                    <Text style={styles.macroLabel}>{isTamil ? 'புரதம்' : 'Protein'}</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroVal}>{food.macros.fat}g</Text>
                    <Text style={styles.macroLabel}>{isTamil ? 'கொழுப்பு' : 'Fat'}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Sangam Reference (if available) */}
            {food.sangamReference && (
              <View style={styles.sangamBox}>
                <Ionicons name="book-outline" size={16} color={COLORS.gold} style={styles.sangamIcon} />
                <View style={styles.sangamContent}>
                  <Text style={styles.sangamTitle}>{isTamil ? 'சங்க இலக்கியம்' : 'Sangam Literature'}</Text>
                  <Text style={styles.sangamText}>"{food.sangamReference.text}"</Text>
                  <Text style={styles.sangamSource}>— {food.sangamReference.source}</Text>
                </View>
              </View>
            )}

            {/* Seasons */}
            <View style={styles.seasonRow}>
              {Object.entries(food.seasonalSuitability).map(([season, status]) => (
                <View key={season} style={[styles.seasonBadge, { backgroundColor: status === 'Best' ? 'rgba(16, 185, 129, 0.2)' : status === 'Recommended' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)' }]}>
                  <Text style={[styles.seasonText, { color: status === 'Best' ? '#10B981' : status === 'Recommended' ? '#60A5FA' : COLORS.textMuted }]}>
                    {season}
                  </Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: SPACING.md,
    width: '100%',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    borderRadius: 28,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(212,175,55,0.4)',
    overflow: 'hidden',
  },
  glowAccent: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(16,185,129,0.2)',
    filter: 'blur(30px)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  titleWrap: { flex: 1 },
  tamilTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.gold,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  englishTitle: {
    fontSize: 14,
    color: '#A7F3D0',
    marginTop: 4,
    fontWeight: '600',
  },
  scoreBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  scoreLabel: {
    fontSize: 9,
    color: COLORS.gold,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  siddhaBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 12,
  },
  floatingIcon: {
    marginTop: 2,
  },
  siddhaText: {
    flex: 1,
    fontSize: 13,
    color: '#D1FAE5',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: SPACING.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  metricLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 6,
    textAlign: 'center',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  comparisonBox: {
    backgroundColor: 'rgba(6,46,37,0.7)',
    padding: SPACING.md,
    borderRadius: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  comparisonTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.gold,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  compRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    alignItems: 'center',
  },
  compLabel: {
    fontSize: 12,
    color: '#D1FAE5',
  },
  compVal: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  healthImpact: {
    fontSize: 12,
    color: '#FCD34D',
    marginTop: 8,
    fontWeight: '600',
    lineHeight: 18,
  },
  seasonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  seasonBadge: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  seasonText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  macrosBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  macrosTitle: {
    fontSize: 12,
    color: COLORS.gold,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  macroLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  sangamBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212,175,55,0.1)',
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  sangamIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  sangamContent: {
    flex: 1,
  },
  sangamTitle: {
    fontSize: 11,
    color: COLORS.gold,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  sangamText: {
    fontSize: 14,
    color: '#fff',
    fontStyle: 'italic',
    marginBottom: 4,
    fontWeight: '600',
  },
  sangamSource: {
    fontSize: 11,
    color: '#D1FAE5',
  },
});

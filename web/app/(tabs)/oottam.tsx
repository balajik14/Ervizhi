import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Animated, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, RADIUS, SPACING } from '../../constants/theme';
import HeritageFoodCard from '../../components/HeritageFoodCard';
import MLRecommendationExplain from '../../components/MLRecommendationExplain';
import heritageFoods from '../_data/heritage_foods.json';
import GlassCard from '../../components/GlassCard';
import { useApp } from '../_layout';

export default function OottamScreen() {
  const { isTamil } = useApp();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(isDesktop ? heritageFoods[0].id : null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [selectedFoodId]);

  const selectedFood = selectedFoodId ? heritageFoods.find(f => f.id === selectedFoodId) : null;

  const renderSidebarItem = ({ item }: { item: any }) => {
    const isSelected = item.id === selectedFoodId;
    return (
      <TouchableOpacity
        style={[styles.menuItem, isSelected && styles.menuItemSelected]}
        onPress={() => setSelectedFoodId(item.id)}
        activeOpacity={0.8}
      >
        <Text style={[styles.menuText, isSelected && styles.menuTextSelected]}>
          {isTamil ? item.tamilName : item.englishName}
        </Text>
        <Text style={[styles.menuSubText, isSelected && styles.menuSubTextSelected]}>
          {isTamil ? item.englishName : item.tamilName}
        </Text>
        {isSelected && (
          <View style={styles.selectedIndicator} />
        )}
      </TouchableOpacity>
    );
  };

  const renderMobileListItem = ({ item }: { item: any }) => {
    return (
      <GlassCard style={styles.mobileListItemContainer}>
        <TouchableOpacity style={styles.mobileListItem} onPress={() => setSelectedFoodId(item.id)} activeOpacity={0.8}>
           <View>
              <Text style={styles.mobileListTitle}>{isTamil ? item.tamilName : item.englishName}</Text>
              <Text style={styles.mobileListSubtitle}>{isTamil ? item.englishName : item.tamilName}</Text>
           </View>
           <Ionicons name="chevron-forward" size={24} color={COLORS.gold} />
        </TouchableOpacity>
      </GlassCard>
    );
  };

  return (
    <LinearGradient colors={GRADIENTS.darkBg} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{isTamil ? 'தொல்சுவை' : 'Tholsuvai'}</Text>
        <Text style={styles.subtitle}>{isTamil ? 'பழங்கால தமிழ் உணவுகள் மற்றும் நுண்ணறிவு' : 'Ancient Tamil Superfoods & Insights'}</Text>
      </View>

      <View style={styles.contentRow}>
        {isDesktop && (
          <View style={styles.sidebar}>
            <FlatList
              data={heritageFoods}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.menuList}
              renderItem={renderSidebarItem}
            />
          </View>
        )}

        <Animated.View style={[styles.detailArea, { opacity: fadeAnim }]}>
          {(!isDesktop && !selectedFood) ? (
            <FlatList
               data={heritageFoods}
               keyExtractor={item => item.id}
               showsVerticalScrollIndicator={false}
               contentContainerStyle={{ paddingBottom: SPACING.xxl }}
               renderItem={renderMobileListItem}
            />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: SPACING.xxl }}>
              {!isDesktop && (
                <TouchableOpacity style={styles.backButton} onPress={() => setSelectedFoodId(null)}>
                  <Ionicons name="leaf-sharp" size={20} color={COLORS.gold} />
                  <Text style={styles.backText}>{isTamil ? 'பின்னே' : 'Back'}</Text>
                </TouchableOpacity>
              )}
              {selectedFood && (
                <GlassCard style={styles.detailCard}>
                  <HeritageFoodCard food={selectedFood} />
                  <View style={{ height: SPACING.lg }} />
                  <MLRecommendationExplain
                    cropName={selectedFood.englishName}
                    ancientBenefitHighlight={selectedFood.comparison.healthImpact}
                    conditions={{
                      soilPh: "Suitable (6.0-7.5)",
                      rainfall: "Requires Less Water",
                      temperature: "High Tolerance",
                      waterAvail: selectedFood.waterSavings > 3 ? "Optimal for low water" : "Adequate",
                      marketTrend: selectedFood.marketDemand === 'High' ? "Increasing Demand" : "Stable"
                    }}
                  />
                </GlassCard>
              )}
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textGold,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 140, // Fixed width for mobile/web hybrid sidebar
    borderRightWidth: 1,
    borderRightColor: 'rgba(212,175,55,0.15)',
    backgroundColor: 'rgba(10,47,36,0.3)',
  },
  menuList: {
    paddingVertical: SPACING.md,
  },
  menuItem: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    position: 'relative',
  },
  menuItemSelected: {
    backgroundColor: 'rgba(212,175,55,0.1)',
  },
  menuText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuTextSelected: {
    color: COLORS.gold,
    fontWeight: 'bold',
  },
  menuSubText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  menuSubTextSelected: {
    color: '#EAB308',
  },
  selectedIndicator: {
    position: 'absolute',
    left: 0,
    top: '25%',
    bottom: '25%',
    width: 3,
    backgroundColor: COLORS.gold,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  detailArea: {
    flex: 1,
    padding: SPACING.md,
  },
  detailCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.goldBorderSoft,
  },
  mobileListItemContainer: { 
    marginBottom: SPACING.md, 
    borderRadius: RADIUS.lg, 
    overflow: 'hidden' 
  },
  mobileListItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: SPACING.lg 
  },
  mobileListTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: COLORS.textPrimary, 
    marginBottom: 4 
  },
  mobileListSubtitle: { 
    fontSize: 14, 
    color: COLORS.textSecondary 
  },
  backButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: SPACING.lg, 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    backgroundColor: 'rgba(212,175,55,0.1)', 
    borderRadius: RADIUS.pill, 
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)'
  },
  backText: { 
    color: COLORS.gold, 
    fontWeight: 'bold', 
    marginLeft: 8 
  }
});

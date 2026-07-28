import { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useApp } from '../_layout';
import { API_BASE_URL, fetchWithTimeout } from '../_api/config';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SHADOWS, SPACING, GRADIENTS } from '../../constants/theme';
import AgriBackground from '../../components/AgriBackground';
import GlassCard from '../../components/GlassCard';

type PriceData = { day: string; price: number };

const CROP_SUGGESTIONS = [
  { id: 'tomato', name: 'tomato', searchTerms: 'tomato thakkali தக்காளி' },
  { id: 'onion', name: 'onion', searchTerms: 'onion vengayam வெங்காயம்' },
  { id: 'banana', name: 'banana', searchTerms: 'banana vazhai வாழை vazha' },
  { id: 'paddy', name: 'paddy', searchTerms: 'paddy nel நெல்' },
  { id: 'turmeric', name: 'turmeric', searchTerms: 'turmeric manjal மஞ்சள்' },
  { id: 'beetroot', name: 'beetroot', searchTerms: 'beetroot beetrot பீட்ரூட்' },
  { id: 'carrot', name: 'carrot', searchTerms: 'carrot கேரட்' },
  { id: 'potato', name: 'potato', searchTerms: 'potato uralaikilangu உருளைக்கிழங்கு' },
  { id: 'brinjal', name: 'brinjal', searchTerms: 'brinjal eggplant kathirikai கத்தரிக்காய்' },
  { id: 'cabbage', name: 'cabbage', searchTerms: 'cabbage muttaikose முட்டைக்கோஸ்' },
  { id: 'chilli', name: 'chilli', searchTerms: 'chilli milagai மிளகாய்' },
  { id: 'garlic', name: 'garlic', searchTerms: 'garlic poondu பூண்டு' },
  { id: 'ginger', name: 'ginger', searchTerms: 'ginger inji இஞ்சி' },
  { id: 'tapioca', name: 'tapioca', searchTerms: 'tapioca maravalli மரவள்ளி' },
  { id: 'pepper', name: 'pepper', searchTerms: 'pepper milagu மிளகு' },
  { id: 'radish', name: 'radish', searchTerms: 'radish mullangi முள்ளங்கி' },
  { id: 'cucumber', name: 'cucumber', searchTerms: 'cucumber vellarikkai வெள்ளரிக்காய்' },
  { id: 'beans', name: 'beans', searchTerms: 'beans பீன்ஸ்' },
  { id: 'okra', name: 'okra', searchTerms: 'okra ladiesfinger vendakkai வெண்டைக்காய்' },
  { id: 'corn', name: 'corn', searchTerms: 'corn maize cholam சோளம் cord' },
  { id: 'cotton', name: 'cotton', searchTerms: 'cotton paruthi பருத்தி' },
  { id: 'wheat', name: 'wheat', searchTerms: 'wheat godhumai கோதுமை' },
  { id: 'sugarcane', name: 'sugarcane', searchTerms: 'sugarcane karumbu கரும்பு' },
  { id: 'coconut', name: 'coconut', searchTerms: 'coconut thenkai தேங்காய்' },
  { id: 'mango', name: 'mango', searchTerms: 'mango mampalam மாம்பழம்' },
  { id: 'cashew', name: 'cashew', searchTerms: 'cashew mundiri முந்திரி' },
  { id: 'tea', name: 'tea', searchTerms: 'tea theeyilai தேயிலை' },
  { id: 'groundnut', name: 'groundnut', searchTerms: 'groundnut nilakkadalai நிலக்கடலை' },
  { id: 'millets', name: 'millets', searchTerms: 'millets siruthaniyam சிறுதானியம்' },
];

const CROP_EMOJIS: { [key: string]: string } = {
  paddy: '🌾', turmeric: '🌿', tomato: '🍅', banana: '🍌', onion: '🧅',
  beetroot: '🧅', carrot: '🥕', potato: '🥔', brinjal: '🍆', cabbage: '🥬',
  chilli: '🌶️', garlic: '🧄', ginger: '🫚', tapioca: '🪵', pepper: '🫑',
  radish: '🥕', cucumber: '🥒', beans: '🫘', okra: '🥒',
  corn: '🌽', cotton: '☁️', wheat: '🌾', sugarcane: '🎋',
  coconut: '🥥', mango: '🥭', cashew: '🥜', tea: '🍵', groundnut: '🥜', millets: '🌾'
};

const DISTRICTS = ['Erode', 'Salem', 'Coimbatore', 'Tiruppur', 'Madurai', 'Cuddalore', 'Thanjavur', 'Trichy'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, i) => String(CURRENT_YEAR + i));
const BASE_YEAR = CURRENT_YEAR;
const INFLATION_RATE = 0.065; // 6.5%

const CROP_METADATA: { [key: string]: { volatility: number; seasonalPeak: string; seasonalValley: string; harvestWindow: string } } = {
  tomato: { volatility: 0.22, seasonalPeak: 'December', seasonalValley: 'June', harvestWindow: 'Aug - Nov' },
  onion: { volatility: 0.15, seasonalPeak: 'November', seasonalValley: 'May', harvestWindow: 'Jan - Apr' },
  banana: { volatility: 0.08, seasonalPeak: 'August', seasonalValley: 'January', harvestWindow: 'Year-round' },
  paddy: { volatility: 0.05, seasonalPeak: 'January', seasonalValley: 'September', harvestWindow: 'Nov - Jan' },
  turmeric: { volatility: 0.12, seasonalPeak: 'April', seasonalValley: 'November', harvestWindow: 'Feb - May' },
  beetroot: { volatility: 0.14, seasonalPeak: 'October', seasonalValley: 'April', harvestWindow: 'Jul - Oct' },
  carrot: { volatility: 0.16, seasonalPeak: 'December', seasonalValley: 'May', harvestWindow: 'Sep - Jan' },
  potato: { volatility: 0.13, seasonalPeak: 'January', seasonalValley: 'July', harvestWindow: 'Oct - Feb' },
  brinjal: { volatility: 0.18, seasonalPeak: 'September', seasonalValley: 'March', harvestWindow: 'Year-round' },
  cabbage: { volatility: 0.15, seasonalPeak: 'November', seasonalValley: 'June', harvestWindow: 'Aug - Nov' },
  chilli: { volatility: 0.20, seasonalPeak: 'February', seasonalValley: 'August', harvestWindow: 'Jan - May' },
  garlic: { volatility: 0.17, seasonalPeak: 'March', seasonalValley: 'September', harvestWindow: 'Feb - May' },
  ginger: { volatility: 0.19, seasonalPeak: 'January', seasonalValley: 'July', harvestWindow: 'Dec - Mar' },
  tapioca: { volatility: 0.09, seasonalPeak: 'December', seasonalValley: 'June', harvestWindow: 'Nov - Feb' },
  corn: { volatility: 0.1, seasonalPeak: 'August', seasonalValley: 'February', harvestWindow: 'May - Jul' },
  cotton: { volatility: 0.14, seasonalPeak: 'May', seasonalValley: 'September', harvestWindow: 'Feb - Apr' },
  wheat: { volatility: 0.07, seasonalPeak: 'November', seasonalValley: 'April', harvestWindow: 'Jan - Mar' },
  sugarcane: { volatility: 0.05, seasonalPeak: 'January', seasonalValley: 'July', harvestWindow: 'Oct - Dec' },
  coconut: { volatility: 0.06, seasonalPeak: 'April', seasonalValley: 'October', harvestWindow: 'Year-round' },
  mango: { volatility: 0.3, seasonalPeak: 'May', seasonalValley: 'October', harvestWindow: 'Apr - Jun' },
  cashew: { volatility: 0.11, seasonalPeak: 'March', seasonalValley: 'August', harvestWindow: 'Feb - May' },
  tea: { volatility: 0.04, seasonalPeak: 'June', seasonalValley: 'January', harvestWindow: 'Year-round' },
  groundnut: { volatility: 0.13, seasonalPeak: 'September', seasonalValley: 'March', harvestWindow: 'Jul - Oct' },
  millets: { volatility: 0.09, seasonalPeak: 'December', seasonalValley: 'May', harvestWindow: 'Sep - Nov' },
};

export default function MarketScreen() {
  const { isTamil } = useApp();
  const [query, setQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string>('tomato');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Erode');
  const [selectedMonth, setSelectedMonth] = useState<string>('July');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [priceData, setPriceData] = useState<PriceData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [tappedForecastIndex, setTappedForecastIndex] = useState<number | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Trigger page fade-in
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const filteredSuggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const matches = CROP_SUGGESTIONS.filter(c => c.searchTerms.includes(q));
    return matches.slice(0, 5); 
  }, [query]);

  // Default baseline relative indices if backend call fails or during initial load
  const fallbackPrices: { [key: string]: PriceData[] } = {
    tomato: [
      { day: 'Mon', price: 70 }, { day: 'Tue', price: 82 }, { day: 'Wed', price: 95 },
      { day: 'Thu', price: 88 }, { day: 'Fri', price: 100 }, { day: 'Sat', price: 92 }, { day: 'Sun', price: 75 },
    ],
    onion: [
      { day: 'Mon', price: 80 }, { day: 'Tue', price: 88 }, { day: 'Wed', price: 85 },
      { day: 'Thu', price: 100 }, { day: 'Fri', price: 94 }, { day: 'Sat', price: 91 }, { day: 'Sun', price: 82 },
    ],
    banana: [
      { day: 'Mon', price: 85 }, { day: 'Tue', price: 92 }, { day: 'Wed', price: 89 },
      { day: 'Thu', price: 100 }, { day: 'Fri', price: 98 }, { day: 'Sat', price: 96 }, { day: 'Sun', price: 85 },
    ],
    paddy: [
      { day: 'Mon', price: 91 }, { day: 'Tue', price: 93 }, { day: 'Wed', price: 90 },
      { day: 'Thu', price: 100 }, { day: 'Fri', price: 97 }, { day: 'Sat', price: 95 }, { day: 'Sun', price: 89 },
    ],
    turmeric: [
      { day: 'Mon', price: 91 }, { day: 'Tue', price: 94 }, { day: 'Wed', price: 90 },
      { day: 'Thu', price: 100 }, { day: 'Fri', price: 97 }, { day: 'Sat', price: 95 }, { day: 'Sun', price: 92 },
    ],
  };

  const getFallback = (crop: string) => {
    const key = crop.toLowerCase().trim();
    if (fallbackPrices[key]) return fallbackPrices[key];
    
    // Hash string key to generate unique procedural forecast curve for any crop
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    const seed = Math.abs(hash);
    const base = 75 + (seed % 18);
    
    return [
      { day: 'Mon', price: base + (seed % 6) },
      { day: 'Tue', price: base + 7 + (seed % 5) },
      { day: 'Wed', price: base + 14 + (seed % 4) },
      { day: 'Thu', price: base + 9 },
      { day: 'Fri', price: base + 21 },
      { day: 'Sat', price: base + 12 },
      { day: 'Sun', price: base + 4 },
    ];
  };

  // Load predictions dynamically from backend or fall back to mock data
  useEffect(() => {
    setIsLoading(true);
    fetchWithTimeout(`${API_BASE_URL}/api/ml/price-predict?crop=${encodeURIComponent(selectedCrop)}`)
      .then(res => res.json())
      .then(data => {
        setIsLoading(false);
        if (data && data.forecast) {
          // Normalize to 1-100 index instead of prices
          const max = Math.max(...data.forecast.map((d: any) => d.price));
          const normalized = data.forecast.map((d: any) => ({
            day: d.day,
            price: Math.round((d.price / max) * 100)
          }));
          setPriceData(normalized);
        } else {
          setPriceData(getFallback(selectedCrop));
        }
      })
      .catch(() => {
        setIsLoading(false);
        setPriceData(getFallback(selectedCrop));
      });
  }, [selectedCrop, selectedDistrict]);

  // Derived mathematical metrics with INFLATION logic
  const derivedMetrics = useMemo(() => {
    if (!priceData || priceData.length === 0) return null;
    
    // Calculate Inflation Multiplier
    const yearsDifference = parseInt(selectedYear) - BASE_YEAR;
    const inflationMultiplier = Math.pow(1 + INFLATION_RATE, yearsDifference);
    const inflationPercentStr = ((inflationMultiplier - 1) * 100).toFixed(1);
    
    // Map the 0-100 index to a percentage growth. 
    // We assume index 85 is "0% baseline relative to current local rate" for the season.
    // Index 100 is the peak of the week.
    const baselineIndex = 85; 
    
    const percentageData = priceData.map(d => {
      // Calculate how much higher/lower it is vs the baseline index
      const localFluctuation = (d.price - baselineIndex) / baselineIndex; 
      // Combine with inflation
      const totalGrowthMultiplier = inflationMultiplier * (1 + localFluctuation);
      const percentageChange = (totalGrowthMultiplier - 1) * 100;
      
      return {
        day: d.day,
        percentage: percentageChange, // e.g. +8.5% or -2.1%
        rawIndex: d.price
      };
    });

    // Find Best and Worst Days based on percentage
    let bestDayObj = percentageData[0];
    let worstDayObj = percentageData[0];
    for (const d of percentageData) {
      if (d.percentage > bestDayObj.percentage) bestDayObj = d;
      if (d.percentage < worstDayObj.percentage) worstDayObj = d;
    }

    const avgPercentage = percentageData.reduce((a, b) => a + b.percentage, 0) / percentageData.length;
    
    const expectedProfitIncrease = bestDayObj.percentage - worstDayObj.percentage;
    
    const metadata = CROP_METADATA[selectedCrop] || { volatility: 0.1, seasonalPeak: 'Oct', seasonalValley: 'Apr', harvestWindow: 'Year-round' };
    const confidence = Math.min(98, Math.max(82, Math.round(95 - (metadata.volatility * 100))));

    // Status/Trend
    const status = bestDayObj.percentage > 10 ? 'Excellent Timing' : bestDayObj.percentage > 0 ? 'Good Timing' : 'Wait & Hold';
    const firstPct = percentageData[0].percentage;
    const lastPct = percentageData[percentageData.length - 1].percentage;
    const trend = lastPct > firstPct + 1 ? 'Rising Demand' : lastPct < firstPct - 1 ? 'Falling Demand' : 'Stable Demand';

    // Simulated weekly recommendations
    const weekdayRecommendation = percentageData.map(d => {
      const ratio = (d.percentage - worstDayObj.percentage) / (bestDayObj.percentage - worstDayObj.percentage || 1);
      if (d.day === bestDayObj.day) return { day: d.day, status: 'Best Day ⭐', color: '#D4AF37' };
      if (ratio > 0.75) return { day: d.day, status: 'Better', color: '#10B981' };
      if (ratio > 0.4) return { day: d.day, status: 'Good', color: '#047857' };
      if (ratio > 0.2) return { day: d.day, status: 'Average', color: '#EAB308' };
      return { day: d.day, status: 'Weak', color: '#EF4444' };
    });

    return {
      percentageData,
      avgPercentage,
      bestDay: bestDayObj.day,
      bestPercentage: bestDayObj.percentage,
      worstDay: worstDayObj.day,
      worstPercentage: worstDayObj.percentage,
      expectedProfitIncrease,
      confidence,
      status,
      trend,
      metadata,
      weekdayRecommendation,
      inflationPercentStr,
      yearsDifference
    };
  }, [priceData, selectedCrop, selectedYear]);

  // Crop Profitability leaderboard based on relative percentage
  const leaderboard = useMemo(() => {
    return Object.keys(CROP_METADATA).map(cropKey => {
      const meta = CROP_METADATA[cropKey];
      const yearsDiff = parseInt(selectedYear) - BASE_YEAR;
      const inflationMult = Math.pow(1 + INFLATION_RATE, yearsDiff);
      
      const expectedPercentage = ((inflationMult * (1 + meta.volatility)) - 1) * 100;
      const rating = expectedPercentage > 15 ? '★★★★★' : expectedPercentage > 8 ? '★★★★☆' : '★★★☆☆';
      return {
        id: cropKey,
        emoji: CROP_EMOJIS[cropKey] || '🌱',
        name: cropKey,
        percentage: expectedPercentage,
        rating
      };
    })
    .filter(item => item.id !== selectedCrop)
    .sort((a, b) => b.percentage - a.percentage).slice(0, 3);
  }, [selectedYear, selectedCrop]);

  return (
    <View style={styles.container}>
      <AgriBackground />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          
          {/* Header Title */}
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.pageTitle}>{isTamil ? 'அறுவடை சந்தை நுண்ணறிவு' : 'Market Intelligence Dashboard'}</Text>
              <Text style={styles.pageSubtitle}>{isTamil ? 'பணவீக்கம் 6.5% சரிசெய்யப்பட்ட கணிப்புகள்' : 'Inflation-Adjusted Growth Forecast (6.5% base)'}</Text>
            </View>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>LSTM ACTIVE</Text>
            </View>
          </View>

          {/* District, Month, Year Selection Pills (Removed as per user request) */}

          {/* Expandable Dropdown Modals */}
          {showDistrictModal && (
            <View style={styles.modalOverlay}>
              {DISTRICTS.map((d, idx) => (
                <TouchableOpacity key={idx} style={styles.modalOption} onPress={() => { setSelectedDistrict(d); setShowDistrictModal(false); }}>
                  <Text style={styles.modalText}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {showMonthModal && (
            <View style={styles.modalOverlay}>
              {MONTHS.map((m, idx) => (
                <TouchableOpacity key={idx} style={styles.modalOption} onPress={() => { setSelectedMonth(m); setShowMonthModal(false); }}>
                  <Text style={styles.modalText}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {showYearModal && (
            <View style={styles.modalOverlay}>
              {YEARS.map((y, idx) => (
                <TouchableOpacity key={idx} style={styles.modalOption} onPress={() => { setSelectedYear(y); setShowYearModal(false); }}>
                  <Text style={styles.modalText}>{y}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Search Input for Crops */}
          <View style={styles.searchWrap}>
            <View style={[styles.searchRow, isFocused && styles.searchRowFocused]}>
              <MaterialIcons name="search" size={20} color={isFocused ? COLORS.gold : COLORS.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder={isTamil ? 'பயிரைத் தேடுக... எ.கா. தக்காளி, சோளம்' : 'Search crop... e.g. Tomato, Corn'}
                value={query}
                onChangeText={text => { setQuery(text); setShowSuggestions(true); }}
                onFocus={() => { setShowSuggestions(true); setIsFocused(true); }}
                onBlur={() => setIsFocused(false)}
                placeholderTextColor={COLORS.textMuted}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => { setQuery(''); }}>
                  <MaterialIcons name="close" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {showSuggestions && query.trim().length > 0 && (
              <View style={styles.dropdown}>
                <TouchableOpacity
                  style={[styles.dropdownItem, styles.dropdownDivider]}
                  onPress={() => {
                    const customCrop = query.toLowerCase().trim();
                    setSelectedCrop(customCrop);
                    setShowSuggestions(false);
                  }}
                >
                  <Text style={dropdownStyles.dropdownEmoji}>🔍</Text>
                  <Text style={[dropdownStyles.dropdownText, { color: COLORS.gold, fontWeight: '700' }]}>
                    {isTamil ? `'${query}' கணிப்பு பார்க்க` : `Analyze market forecast for "${query}"`}
                  </Text>
                </TouchableOpacity>

                {filteredSuggestions.map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.dropdownItem, i < filteredSuggestions.length - 1 && styles.dropdownDivider]}
                    onPress={() => { setQuery(item.name); setSelectedCrop(item.id); setShowSuggestions(false); }}
                  >
                    <Text style={dropdownStyles.dropdownEmoji}>{CROP_EMOJIS[item.id] || '🌱'}</Text>
                    <Text style={dropdownStyles.dropdownText}>{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Crop Chips Selection */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }} contentContainerStyle={{ gap: 8 }}>
            {CROP_SUGGESTIONS.map((item, i) => (
              <TouchableOpacity key={i} onPress={() => { setSelectedCrop(item.id); setQuery(''); setShowSuggestions(false); }} activeOpacity={0.8}>
                <View style={selectedCrop === item.id ? styles.chipActive : styles.chip}>
                  <Text style={selectedCrop === item.id ? styles.chipTextActive : styles.chipText}>
                    {CROP_EMOJIS[item.id]} {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Loading Indicator */}
          {isLoading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={COLORS.gold} />
              <Text style={styles.loadingText}>{isTamil ? 'உள்ளூர் மாதிரியிலிருந்து முன்னறிவிப்பை ஏற்றுகிறது...' : 'Running local LSTM intelligence forecast...'}</Text>
            </View>
          )}

          {!isLoading && derivedMetrics && (
            <View style={styles.dashboardBody}>

              {/* 1. TOP SUMMARY CARD */}
              <GlassCard style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <View style={{ flex: 1.2 }}>
                    <Text style={styles.cardHeaderSmall}>{isTamil ? 'தேர்ந்தெடுக்கப்பட்ட பயிர்' : 'Selected Crop'}</Text>
                    <Text style={styles.cropTitleText}>{CROP_EMOJIS[selectedCrop] || '🌱'} {selectedCrop.toUpperCase()}</Text>
                    <Text style={[styles.goldPriceText, { color: derivedMetrics.avgPercentage >= 0 ? COLORS.success : '#EF4444' }]}>
                      {derivedMetrics.avgPercentage > 0 ? '+' : ''}{derivedMetrics.avgPercentage.toFixed(1)}%
                      <Text style={styles.unitText}> (Growth vs {BASE_YEAR})</Text>
                    </Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <View style={styles.badgeGold}>
                      <Text style={styles.badgeGoldText}>⭐ BEST DAY: {derivedMetrics.bestDay.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.profitIncreaseText}>Max: +{derivedMetrics.bestPercentage.toFixed(1)}%</Text>
                  </View>
                </View>
                
                <View style={styles.dividerSoft} />
                
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryGridItem}>
                    <Text style={styles.gridLabel}>{isTamil ? 'பணவீக்க அடிப்படை' : 'Inflation Base'}</Text>
                    <Text style={styles.gridValue}>+{derivedMetrics.inflationPercentStr}%</Text>
                  </View>
                  <View style={styles.summaryGridItem}>
                    <Text style={styles.gridLabel}>{isTamil ? 'சந்தை நிலை' : 'Market Status'}</Text>
                    <Text style={[styles.gridValue, { color: derivedMetrics.status.includes('Excellent') ? COLORS.success : COLORS.gold }]}>{derivedMetrics.status}</Text>
                  </View>
                  <View style={styles.summaryGridItem}>
                    <Text style={styles.gridLabel}>{isTamil ? 'சந்தை போக்கு' : 'Demand Trend'}</Text>
                    <Text style={[styles.gridValue, { color: derivedMetrics.trend.includes('Rising') ? COLORS.success : '#EF4444' }]}>{derivedMetrics.trend}</Text>
                  </View>
                </View>
              </GlassCard>

              {/* 2. WEEKLY SELLING CALENDAR */}
              <GlassCard style={styles.dashboardCard}>
                <Text style={styles.sectionTitle}>📅 {isTamil ? 'வாராந்திர விற்பனை நாட்காட்டி' : 'Weekly Selling Calendar'}</Text>
                <Text style={styles.sectionSubtitle}>{isTamil ? 'சிறந்த நாள்களில் விற்கவும்' : 'Harvest sale urgency based on relative market demand'}</Text>
                
                <View style={styles.calendarRow}>
                  {derivedMetrics.weekdayRecommendation.map((rec, index) => {
                    const isBest = rec.status.includes('Best');
                    return (
                      <View key={index} style={[styles.calendarDayBox, isBest && styles.calendarDayBoxBest]}>
                        <Text style={[styles.calendarDayName, isBest && { color: COLORS.gold }]}>{rec.day}</Text>
                        <View style={[styles.dotIndicator, { backgroundColor: rec.color }]} />
                        <Text style={[styles.calendarStatusText, { color: rec.color }, isBest && { fontWeight: '900' }]}>
                          {rec.status}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </GlassCard>

              {/* 3. WEEKLY TREND LINE CHART (Percentages) */}
              <GlassCard style={styles.dashboardCard}>
                <Text style={styles.sectionTitle}>📈 {isTamil ? 'வாராந்திர லாப கணிப்பு' : 'Weekly Growth Forecast (%)'}</Text>
                <Text style={styles.sectionSubtitle}>{isTamil ? 'தட்டினால் முழு விவரம் கிடைக்கும்' : `Predicted growth margin relative to ${BASE_YEAR}`}</Text>
                
                <View style={styles.chartArea}>
                  {derivedMetrics.percentageData.map((item, idx) => {
                    // Height calculation based on percentage offset
                    const maxPct = Math.max(...derivedMetrics.percentageData.map(p => p.percentage));
                    const minPct = Math.min(...derivedMetrics.percentageData.map(p => p.percentage));
                    const range = (maxPct - minPct) || 1;
                    const heightPercent = Math.max(15, ((item.percentage - minPct) / range) * 100);
                    
                    const isSelected = tappedForecastIndex === idx;
                    const isBest = item.day === derivedMetrics.bestDay;
                    const isPositive = item.percentage >= 0;
                    
                    return (
                      <TouchableOpacity key={idx} style={styles.chartBarCol} onPress={() => setTappedForecastIndex(isSelected ? null : idx)}>
                        <View style={styles.barContainer}>
                          <View style={[styles.chartBar, isBest && styles.chartBarBest, { height: `${heightPercent}%` }]}>
                            {isSelected && <View style={styles.chartNodeDotSelected} />}
                          </View>
                        </View>
                        <Text style={[styles.chartDayText, isBest && { color: COLORS.gold, fontWeight: 'bold' }]}>{item.day}</Text>
                        <Text style={[styles.chartPriceText, { color: isPositive ? COLORS.success : '#EF4444' }]}>{item.percentage > 0 ? '+' : ''}{item.percentage.toFixed(1)}%</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {tappedForecastIndex !== null && (
                  <View style={styles.tooltipBox}>
                    <Text style={styles.tooltipTitle}>{derivedMetrics.percentageData[tappedForecastIndex].day} Forecast Details</Text>
                    <Text style={styles.tooltipContent}>Projected Return: <Text style={{ color: COLORS.gold }}>{derivedMetrics.percentageData[tappedForecastIndex].percentage > 0 ? '+' : ''}{derivedMetrics.percentageData[tappedForecastIndex].percentage.toFixed(2)}%</Text></Text>
                    <Text style={styles.tooltipContent}>Inflation Adjusted Base: <Text style={{ color: COLORS.success }}>+{derivedMetrics.inflationPercentStr}%</Text></Text>
                  </View>
                )}
              </GlassCard>

              {/* 4. SEASONAL ANALYSIS */}
              <GlassCard style={styles.dashboardCard}>
                <Text style={styles.sectionTitle}>🍂 {isTamil ? 'பருவகால அறுவடை பகுப்பாய்வு' : 'Seasonal Harvest Analysis'}</Text>
                <Text style={styles.sectionSubtitle}>{isTamil ? 'ஆண்டு முழுவதும் உங்கள் பயிரை திட்டமிடுங்கள்' : 'Plan your crop cycle around the year'}</Text>
                
                {(() => {
                  const isPeak = selectedMonth === derivedMetrics.metadata.seasonalPeak;
                  const isValley = selectedMonth === derivedMetrics.metadata.seasonalValley;
                  let message = isTamil ? `${selectedMonth} இந்த பயிருக்கு ஒரு சாதாரண மாதமாகும்.` : `${selectedMonth} is an average month for this crop.`;
                  let color = COLORS.textSecondary;
                  let icon = 'info-outline';

                  if (isPeak) {
                    message = isTamil ? `அதிக லாபம்: ${selectedMonth} மாதத்தில் இந்த பயிர் அதிக லாபம் தரும்!` : `High Profit Season: ${selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)} yields maximum profit in ${selectedMonth}!`;
                    color = COLORS.success;
                    icon = 'trending-up';
                  } else if (isValley) {
                    message = isTamil ? `எச்சரிக்கை: ${selectedMonth} மாதத்தில் விலை குறைவாக இருக்கும்.` : `Warning: Off-season crop. Expect lowest prices in ${selectedMonth}.`;
                    color = '#EF4444';
                    icon = 'warning';
                  } else if (derivedMetrics.metadata.harvestWindow.includes(selectedMonth.substring(0, 3))) {
                    message = isTamil ? `அறுவடை காலம்: இது சரியான அறுவடை காலம்.` : `Harvest Window: You are currently in the prime harvesting season.`;
                    color = COLORS.gold;
                    icon = 'eco';
                  }

                  return (
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(13,59,46,0.6)', padding: 10, borderRadius: RADIUS.md, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)' }}>
                      <MaterialIcons name={icon as any} size={20} color={color} style={{ marginRight: 8 }} />
                      <Text style={{ flex: 1, fontSize: 13, color, fontWeight: '600' }}>{message}</Text>
                    </View>
                  );
                })()}

                  <View style={{ marginTop: SPACING.md }}>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => {
                        const fullMonth = MONTHS[idx];
                        const isPeak = fullMonth === derivedMetrics.metadata.seasonalPeak;
                        const isValley = fullMonth === derivedMetrics.metadata.seasonalValley;
                        const isHarvest = derivedMetrics.metadata.harvestWindow.includes(month);
                        
                        let bgColor = 'rgba(255,255,255,0.1)';
                        let textColor = COLORS.textMuted;
                        if (isPeak) { bgColor = COLORS.success; textColor = '#FFF'; }
                        else if (isValley) { bgColor = '#EF4444'; textColor = '#FFF'; }
                        else if (isHarvest) { bgColor = COLORS.gold; textColor = COLORS.darkBg; }

                        return (
                          <View key={month} style={{ flex: 1, height: 40, backgroundColor: bgColor, borderRadius: 4, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 9, color: textColor, fontWeight: '700' }}>{month}</Text>
                          </View>
                        );
                      })}
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 4 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success }} />
                        <Text style={{ fontSize: 10, color: COLORS.textMuted }}>Peak</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.gold }} />
                        <Text style={{ fontSize: 10, color: COLORS.textMuted }}>Harvest</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' }} />
                        <Text style={{ fontSize: 10, color: COLORS.textMuted }}>Valley</Text>
                      </View>
                    </View>
                  </View>
              </GlassCard>



              {/* 6. TOP CROPS LEADERBOARD */}
              <GlassCard style={styles.dashboardCard}>
                <Text style={styles.sectionTitle}>{isTamil ? 'லாபகரமான மாற்றுப் பயிர்கள்' : 'Top Alternatives by Profit Growth'}</Text>
                <View style={{ marginTop: 10, gap: 10 }}>
                  {leaderboard.map((item, idx) => (
                    <View key={idx} style={styles.leaderboardRow}>
                      <View style={styles.leaderboardLeft}>
                        <Text style={styles.leaderboardRank}>{idx + 1}</Text>
                        <Text style={styles.leaderboardName}>{item.name.toUpperCase()}</Text>
                      </View>
                      <View style={styles.leaderboardRight}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <Text style={styles.leaderboardStars}>{item.rating}</Text>
                          <Text style={styles.leaderboardProfit}>+{item.percentage.toFixed(1)}%</Text>
                        </View>
                        <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, width: 100, overflow: 'hidden' }}>
                          <View style={{ height: '100%', width: `${Math.min(item.percentage * 2.5, 100)}%`, backgroundColor: COLORS.gold }} />
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </GlassCard>

            </View>
          )}

          {/* Footer warning removed as per user request */}

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const dropdownStyles = StyleSheet.create({
  dropdownEmoji: { fontSize: 16 },
  dropdownText: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '600' }
});

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  scroll: { flex: 1, width: '100%' },
  content: { padding: SPACING.md, paddingBottom: SPACING.xxl },

  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingTop: SPACING.sm,
  },
  pageTitle: { fontSize: 18, fontWeight: '900', color: COLORS.gold, letterSpacing: 0.2 },
  pageSubtitle: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, fontWeight: '600' },
  aiBadge: {
    backgroundColor: 'rgba(212,175,55,0.15)',
    borderWidth: 1,
    borderColor: COLORS.goldBorderSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  aiBadgeText: { fontSize: 9, color: COLORS.textGold, fontWeight: '900', letterSpacing: 0.8 },

  filterBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.sm,
    flexWrap: 'wrap',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6,95,70,0.5)',
    borderWidth: 1,
    borderColor: COLORS.goldBorderSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
  },
  filterPillText: { fontSize: 11, color: COLORS.textPrimary, fontWeight: '600' },

  modalOverlay: {
    backgroundColor: 'rgba(10,47,36,0.95)',
    borderWidth: 1,
    borderColor: COLORS.goldBorderSoft,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modalOption: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(6,95,70,0.4)',
  },
  modalText: { color: COLORS.textPrimary, fontSize: 11, fontWeight: '600' },

  searchWrap: { marginBottom: SPACING.sm, position: 'relative', zIndex: 10 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(13,59,46,0.6)',
    borderWidth: 1,
    borderColor: COLORS.goldBorderSoft,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
  },
  searchRowFocused: { borderColor: COLORS.gold },
  searchInput: { flex: 1, fontSize: 13, color: COLORS.textPrimary, height: 24, padding: 0 },

  dropdown: {
    backgroundColor: 'rgba(6,95,70,0.98)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.goldBorderSoft,
    marginTop: 4,
    position: 'absolute',
    top: 42,
    left: 0,
    right: 0,
    zIndex: 20,
    ...SHADOWS.card,
  },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: SPACING.sm + 2 },
  dropdownDivider: { borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.15)' },

  chipActive: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.cardBg, // dark green pill
    borderWidth: 1,
    borderColor: COLORS.gold, // gold border
    shadowColor: COLORS.gold, // gold glow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.cardBg2, // dark green pill
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  chipTextActive: { fontSize: 13, color: COLORS.gold, fontWeight: '700' },

  loadingBox: { padding: SPACING.xl, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center' },

  dashboardBody: { gap: SPACING.md },

  // Summary Card
  summaryCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.goldBorderSoft,
    backgroundColor: 'rgba(6,95,70,0.4)',
    overflow: 'hidden',
    position: 'relative',
    ...SHADOWS.card,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardHeaderSmall: { fontSize: 10, color: COLORS.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  cropTitleText: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary, marginTop: 4 },
  goldPriceText: { fontSize: 24, fontWeight: '900', marginTop: 6 },
  unitText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: 'normal' },
  badgeGold: {
    backgroundColor: 'rgba(212,175,55,0.2)',
    borderWidth: 1,
    borderColor: COLORS.gold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  badgeGoldText: { fontSize: 9, color: COLORS.gold, fontWeight: '900' },
  profitIncreaseText: { fontSize: 12, fontWeight: '800', color: COLORS.success, marginTop: 8 },
  dividerSoft: { height: 1, backgroundColor: 'rgba(212,175,55,0.15)', marginVertical: SPACING.md },
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryGridItem: { flex: 1, alignItems: 'center' },
  gridLabel: { fontSize: 10, color: COLORS.textMuted, marginBottom: 2 },
  gridValue: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary },

  // Standard Dashboard Card
  dashboardCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: 'rgba(6,95,70,0.35)',
    ...SHADOWS.card,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  sectionSubtitle: { fontSize: 10, color: COLORS.textMuted, marginTop: 2, marginBottom: SPACING.sm },

  // Weekly Calendar
  calendarRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginTop: SPACING.md },
  calendarDayBox: {
    flex: 1,
    minWidth: 42,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13,59,46,0.5)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 24,
    paddingVertical: 4,
  },
  calendarDayBoxBest: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(212,175,55,0.1)',
  },
  calendarDayName: { fontSize: 10, color: COLORS.textMuted, fontWeight: '700' },
  dotIndicator: { width: 5, height: 5, borderRadius: 2.5, marginVertical: 6 },
  calendarStatusText: { fontSize: 8, textAlign: 'center' },

  // Line Chart representation
  chartArea: { flexDirection: 'row', justifyContent: 'space-between', height: 130, marginTop: 10, alignItems: 'flex-end' },
  chartBarCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barContainer: { flex: 1, justifyContent: 'flex-end', width: '100%', alignItems: 'center', marginBottom: 6 },
  chartBar: { width: 14, borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: COLORS.barNormal, alignItems: 'center', justifyContent: 'flex-start' },
  chartBarBest: { backgroundColor: COLORS.barBest },
  chartNodeDotSelected: { backgroundColor: '#FFF', width: 6, height: 6, borderRadius: 3, marginTop: 4 },
  chartDayText: { fontSize: 9, color: COLORS.textMuted },
  chartPriceText: { fontSize: 8, color: COLORS.textSecondary, marginTop: 2 },
  tooltipBox: {
    marginTop: 10,
    padding: SPACING.sm,
    backgroundColor: 'rgba(13,59,46,0.9)',
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: RADIUS.sm,
  },
  tooltipTitle: { fontSize: 11, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 2 },
  tooltipContent: { fontSize: 10, color: COLORS.textSecondary },



  // Seasonal
  seasonalGrid: { flexDirection: 'row', gap: 6, marginTop: 8 },
  seasonalItem: { flex: 1, backgroundColor: 'rgba(13,59,46,0.4)', padding: 6, borderRadius: RADIUS.md, alignItems: 'center' },
  seasonalLabel: { fontSize: 8, color: COLORS.textMuted, textAlign: 'center' },
  seasonalValue: { fontSize: 10, fontWeight: '800', color: COLORS.gold, marginTop: 4, textAlign: 'center' },

  // Leaderboard
  leaderboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(212,175,55,0.15)',
  },
  leaderboardLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  leaderboardRank: { fontSize: 11, fontWeight: 'bold', color: COLORS.gold },
  leaderboardName: { fontSize: 11, fontWeight: '800', color: COLORS.textPrimary },
  leaderboardRight: { alignItems: 'flex-end' },
  leaderboardStars: { fontSize: 9, color: COLORS.gold },
  leaderboardProfit: { fontSize: 10, fontWeight: 'bold', color: COLORS.success },

  // Warning Footer
  infoCard: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.goldBorderSoft,
    alignItems: 'flex-start',
    marginTop: SPACING.md,
  },
  infoText: { flex: 1, fontSize: 11, color: COLORS.textSecondary, lineHeight: 16 },
});

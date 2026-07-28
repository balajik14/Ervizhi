import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, ScrollView, Animated
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../_layout';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

// Import the real dataset from assets
const TRADE_DATA = require('../../assets/trade_data.json') as Array<{
  crop: string;
  seasonality: string;
  demand: string;
  country: string;
  driver: string;
  classification?: string;
  tamil_name?: string;
}>;

// Demand level color mapping (emerald green & gold - no orange)
const demandColor = (demand: string) => {
  switch (demand.toLowerCase()) {
    case 'very high':  return { bg: COLORS.emerald, text: COLORS.textPrimary };
    case 'high':       return { bg: COLORS.forest, text: COLORS.textPrimary };
    case 'increasing': return { bg: 'rgba(212,175,55,0.25)', text: COLORS.textGold };
    case 'stable':     return { bg: 'rgba(3,53,33,0.6)', text: COLORS.textSecondary };
    case 'moderate':   return { bg: 'rgba(3,53,33,0.4)', text: COLORS.textMuted };
    default:           return { bg: 'rgba(2,26,14,0.4)', text: COLORS.textMuted };
  }
};

export default function ExportScreen() {
  const { isTamil } = useApp();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<typeof TRADE_DATA[0] | null>(null);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const [activeInput, setActiveInput] = useState<boolean>(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return TRADE_DATA.filter(d =>
      d.crop.toLowerCase().includes(q) ||
      (d.tamil_name && d.tamil_name.toLowerCase().includes(q))
    ).slice(0, 20);
  }, [query]);

  const handleSelect = (item: typeof TRADE_DATA[0]) => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    setSelected(item);
    setQuery('');
  };

  const demandBadge = selected ? demandColor(selected.demand) : null;

  return (
    <LinearGradient
      colors={GRADIENTS.darkBg}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="public" size={24} color={COLORS.gold} />
        </View>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.headerTitle}>
            {isTamil ? 'ஏற்றுமதி உதவியாளர்' : 'Export Assistant'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isTamil ? 'உங்கள் வேளாண் பொருளுக்கு உலக தேவையை கண்டறியுங்கள்' : 'Find global demand for your agri product'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Search */}
        <View style={styles.searchCard}>
          <Text style={styles.label}>
            {isTamil ? 'பொருளை தேடுங்கள்' : 'Search Your Agri Product'}
          </Text>
          <View style={styles.searchRow}>
            <TextInput
              style={[
                styles.input,
                activeInput && styles.inputFocused
              ]}
              placeholder={isTamil ? "எ.கா. மஞ்சள், முந்திரி" : "e.g. Turmeric, Cashew"}
              value={query}
              onChangeText={setQuery}
              placeholderTextColor="rgba(236,253,245,0.4)"
              onFocus={() => setActiveInput(true)}
              onBlur={() => setActiveInput(false)}
            />
            <View style={styles.searchIcon}>
              <MaterialIcons name="search" size={22} color={COLORS.gold} />
            </View>
          </View>

          {/* Autocomplete dropdown */}
          {filtered.length > 0 && (
            <View style={styles.dropdown}>
              {filtered.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.dropdownItem}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dropdownText}>{item.crop}</Text>
                  <View style={[styles.demandBadge, { backgroundColor: demandColor(item.demand).bg }]}>
                    <Text style={[styles.demandText, { color: demandColor(item.demand).text }]}>{item.demand}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Result Detail Card */}
        {selected && demandBadge && (
          <Animated.View style={[styles.resultCard, { transform: [{ scale: scaleAnim }] }]}>
            {/* Gold Accent Corner lines */}
            <View style={styles.goldCornerLine} />
            
            <View style={styles.resultHeader}>
              <Text style={styles.resultCrop}>{selected.crop}</Text>
              <View style={[styles.bigBadge, { backgroundColor: demandBadge.bg, borderColor: COLORS.goldBorderSoft, borderWidth: 0.5 }]}>
                <Text style={[styles.bigBadgeText, { color: demandBadge.text }]}>{selected.demand}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={18} color={COLORS.gold} />
              <Text style={styles.infoLabel}>{isTamil ? 'இறக்குமதி நாடு:' : 'Importer Country:'}</Text>
              <Text style={styles.infoValue}>{selected.country}</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialIcons name="calendar-today" size={16} color={COLORS.gold} />
              <Text style={styles.infoLabel}>{isTamil ? 'சீசன்:' : 'Season:'}</Text>
              <Text style={styles.infoValue}>{selected.seasonality}</Text>
            </View>

            {selected.classification && (
              <View style={styles.infoRow}>
                <MaterialIcons name="category" size={16} color={COLORS.gold} />
                <Text style={styles.infoLabel}>{isTamil ? 'வகைப்பாடு:' : 'Classification:'}</Text>
                <Text style={styles.infoValue}>{selected.classification}</Text>
              </View>
            )}

            <View style={styles.driverBox}>
              <Text style={styles.driverTitle}>
                <MaterialIcons name="trending-up" size={16} color={COLORS.textGold} /> {isTamil ? '2026 சந்தை காரணி:' : '2026 Market Driver & Insight:'}
              </Text>
              <Text style={styles.driverText}>{selected.driver}</Text>
              
              <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(212,175,55,0.15)' }}>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 4 }}>
                  <MaterialIcons name="lightbulb" size={14} color={COLORS.gold} /> {isTamil ? 'செயல் உத்தி:' : 'Strategic Action:'}
                </Text>
                <Text style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 }}>
                  {isTamil ? 'சிறந்த விலைக்காக இந்த பருவத்தில் பேக்கிங் தொடங்கவும்.' : `Target ${selected.country} buyers ahead of the ${selected.seasonality} season. ${selected.demand.includes('High') ? 'Demand is peaking, secure logistics early.' : 'Monitor local auction rates before shipping.'}`}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Stats banner */}
        {!selected && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>{isTamil ? 'வேளாண் தரவுத்தளம்' : 'Agri Dataset'}</Text>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{TRADE_DATA.length}</Text>
                <Text style={styles.statLabel}>{isTamil ? 'பொருட்கள்' : 'Products'}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{new Set(TRADE_DATA.map(d => d.country)).size}</Text>
                <Text style={styles.statLabel}>{isTamil ? 'நாடுகள்' : 'Countries'}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{TRADE_DATA.filter(d => d.demand === 'Very High').length}</Text>
                <Text style={styles.statLabel}>{isTamil ? 'உயர் தேவை' : 'High Demand'}</Text>
              </View>
            </View>
            <Text style={styles.hint}>
              {isTamil ? '⬆ மேலே உங்கள் வேளாண் பொருளின் பெயரை தட்டச்சு செய்யவும்' : '⬆ Type your agri product name above to see global demand'}
            </Text>
          </View>
        )}

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,175,55,0.15)',
  },
  iconContainer: {
    backgroundColor: 'rgba(4,106,56,0.3)',
    borderColor: 'rgba(212,175,55,0.2)',
    borderWidth: 1,
    padding: SPACING.sm,
    borderRadius: RADIUS.pill,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  headerSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  body: { flex: 1, padding: SPACING.md },

  searchCard: {
    backgroundColor: COLORS.glassCard,
    borderColor: COLORS.glassBorder,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  label: { fontSize: 14, fontWeight: 'bold', color: COLORS.textSecondary, marginBottom: 10 },
  searchRow: { flexDirection: 'row', alignItems: 'center', position: 'relative' },
  input: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingRight: 40,
  },
  inputFocused: {
    borderColor: COLORS.inputFocusBorder,
  },
  searchIcon: { position: 'absolute', right: 12 },

  dropdown: {
    marginTop: 8,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.goldBorderSoft,
    backgroundColor: COLORS.cardBg,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,175,55,0.08)',
  },
  dropdownText: { fontSize: 15, color: COLORS.textPrimary, flex: 1 },
  demandBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    marginLeft: 8,
  },
  demandText: { fontSize: 10, fontWeight: 'bold' },

  resultCard: {
    backgroundColor: COLORS.glassCard,
    borderColor: COLORS.glassBorder,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    position: 'relative',
    ...SHADOWS.card,
  },
  goldCornerLine: {
    position: 'absolute',
    left: 0,
    top: 20,
    bottom: 20,
    width: 3.5,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingLeft: SPACING.sm,
  },
  resultCrop: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary, flex: 1 },
  bigBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  bigBadgeText: { fontSize: 12, fontWeight: 'bold' },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingLeft: SPACING.sm,
  },
  infoLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: 'bold', marginLeft: 8, marginRight: 6 },
  infoValue: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '600', flex: 1 },

  driverBox: {
    backgroundColor: 'rgba(4,106,56,0.25)',
    borderColor: 'rgba(212,175,55,0.15)',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: 14,
    marginTop: 8,
    marginBottom: SPACING.lg,
    marginLeft: SPACING.sm,
  },
  driverTitle: { fontSize: 13, fontWeight: 'bold', color: COLORS.textGold, marginBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 4 },
  driverText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    marginLeft: SPACING.sm,
    ...SHADOWS.button,
  },
  actionButtonText: { color: COLORS.textDark, fontSize: 15, fontWeight: 'bold' },

  statsCard: {
    backgroundColor: COLORS.glassCard,
    borderColor: COLORS.glassBorder,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  statsTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textGold, marginBottom: SPACING.lg, letterSpacing: 0.5 },
  statRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: SPACING.lg },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: COLORS.textPrimary },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4 },
  hint: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', fontStyle: 'italic', marginTop: 4 },
});

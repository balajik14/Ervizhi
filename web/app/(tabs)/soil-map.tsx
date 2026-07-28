import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  FlatList,
  Platform,
} from 'react-native';
import { MapView, Marker, PROVIDER_DEFAULT } from '../../components/MapComponent';
import { useApp } from '../_layout';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { DISTRICT_SOIL_DATA, DistrictSoilInfo } from '../../constants/soilData';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, SHADOWS, RADIUS, SPACING } from '../../constants/theme';
import AgriBackground from '../../components/AgriBackground';

import cropDataRaw from '../../assets/crop_suggestion.json';

interface CropSuggestion {
  "Constituency Name": string;
  "District": string;
  "Crop 1": string;
  "Crop 2": string;
  "Crop 3": string;
}

const cropData = cropDataRaw as CropSuggestion[];
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SOIL_COLORS: Record<string, string> = {
  'Red Soil':     '#D32F2F',
  'Black Soil':   '#424242',
  'Alluvial Soil':'#D4AF37', // Gold feel
  'Laterite Soil':'#E65100',
  'Sandy Soil':   '#00B0FF',
};

// Initial region: Tamil Nadu center
const TN_REGION = {
  latitude: 11.05,
  longitude: 78.6,
  latitudeDelta: 5.5,
  longitudeDelta: 4.8,
};

const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.55;

export default function SoilMapScreen() {
  const { isTamil } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeInput, setActiveInput] = useState(false);

  // Map tile mode
  const [isSatellite, setIsSatellite] = useState(true);

  // Filter state
  const [activeSoilFilter, setActiveSoilFilter] = useState<string | null>(null);

  // Selected district → drives the bottom sheet
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictSoilInfo | null>(null);

  // Bottom sheet animation
  const sheetAnim = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;
  const sheetVisible = useRef(false);

  const mapRef = useRef<any>(null);

  const openSheet = useCallback((district: DistrictSoilInfo) => {
    setSelectedDistrict(district);
    sheetVisible.current = true;
    Animated.spring(sheetAnim, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();

    // Animate map to the tapped district
    mapRef.current?.animateToRegion(
      {
        latitude: district.latitude - 0.5,
        longitude: district.longitude,
        latitudeDelta: 2.5,
        longitudeDelta: 2.0,
      },
      500
    );
  }, [sheetAnim]);

  const handleMapPress = useCallback((e: any) => {
    const coord = e?.nativeEvent?.coordinate;
    if (!coord) return;
    const { latitude, longitude } = coord;
    
    let closest = DISTRICT_SOIL_DATA[0];
    let minDistance = Number.MAX_VALUE;

    DISTRICT_SOIL_DATA.forEach(d => {
      const dist = Math.hypot(d.latitude - latitude, d.longitude - longitude);
      if (dist < minDistance) {
        minDistance = dist;
        closest = d;
      }
    });

    if (closest) {
      openSheet(closest);
    }
  }, [openSheet]);

  const closeSheet = useCallback(() => {
    Animated.timing(sheetAnim, {
      toValue: BOTTOM_SHEET_HEIGHT,
      duration: 280,
      useNativeDriver: true,
    }).start(() => {
      sheetVisible.current = false;
      setSelectedDistrict(null);
    });
  }, [sheetAnim]);

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase().trim();
    const matches: Array<{ type: 'district' | 'constituency'; name: string; subtitle: string; data: any }> = [];

    DISTRICT_SOIL_DATA.forEach(d => {
      if (d.name.toLowerCase().includes(query) || d.tamilName.includes(query)) {
        matches.push({ type: 'district', name: d.name, subtitle: isTamil ? d.tamilName : 'District', data: d });
      }
    });
    cropData.forEach(c => {
      const constName = c['Constituency Name'];
      if (constName && constName.toLowerCase().includes(query)) {
        matches.push({ type: 'constituency', name: constName, subtitle: isTamil ? `${c.District} மாவட்டம்` : `Constituency in ${c.District}`, data: c });
      }
    });
    return matches.slice(0, 8);
  }, [searchQuery, isTamil]);

  const handleSelectSuggestion = (suggestion: any) => {
    if (suggestion.type === 'district') {
      const d = suggestion.data as DistrictSoilInfo;
      setSearchQuery(isTamil ? d.tamilName : d.name);
      openSheet(d);
    } else {
      const c = suggestion.data as CropSuggestion;
      const d = DISTRICT_SOIL_DATA.find(dist => dist.name.toLowerCase() === c.District.toLowerCase());
      if (d) {
        setSearchQuery(`${c['Constituency Name']} (${isTamil ? d.tamilName : d.name})`);
        openSheet(d);
      }
    }
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    closeSheet();
    mapRef.current?.animateToRegion(TN_REGION, 600);
  };

  const handleAnalyzeInPlanner = () => {
    if (selectedDistrict) {
      router.push({ pathname: '/farm', params: { query: selectedDistrict.name } });
      closeSheet();
    }
  };

  // Soil filter pills
  const soilFilters = [
    { label: isTamil ? 'அனைத்தும்' : 'All',          value: null,           color: COLORS.gold },
    { label: isTamil ? 'செம்மண்'   : 'Red Soil',      value: 'Red Soil',     color: SOIL_COLORS['Red Soil'] },
    { label: isTamil ? 'கரிசல்'    : 'Black Soil',    value: 'Black Soil',   color: SOIL_COLORS['Black Soil'] },
    { label: isTamil ? 'வண்டல்'    : 'Alluvial',      value: 'Alluvial Soil', color: SOIL_COLORS['Alluvial Soil'] },
    { label: isTamil ? 'செம்பூரான்': 'Laterite',      value: 'Laterite Soil', color: SOIL_COLORS['Laterite Soil'] },
    { label: isTamil ? 'மணல்'      : 'Sandy',          value: 'Sandy Soil',   color: SOIL_COLORS['Sandy Soil'] },
  ];

  const filteredDistricts = useMemo(() =>
    activeSoilFilter
      ? DISTRICT_SOIL_DATA.filter(d => d.soilType === activeSoilFilter)
      : DISTRICT_SOIL_DATA,
    [activeSoilFilter]
  );

  // Constants theme values
  const cardBg        = COLORS.glassCard;
  const cardBg2       = 'rgba(4,106,56,0.3)';
  const cardText      = COLORS.textPrimary;
  const secondaryText = COLORS.textSecondary;
  const dividerColor  = 'rgba(212,175,55,0.15)';

  // N-P-K progress color
  const npkColors = { N: '#E65100', P: '#D4AF37', K: '#10B981' };
  const maxN = 150, maxP = 80, maxK = 350;

  return (
    <View style={styles.container}>
      <AgriBackground />
      {/* ── Search Bar ── */}
      <View style={[
        styles.searchWrapper, 
        { backgroundColor: cardBg, borderColor: activeInput ? COLORS.inputFocusBorder : COLORS.glassBorder }
      ]}>
        <Ionicons name="search" size={18} color={COLORS.gold} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: cardText }]}
          placeholder={isTamil ? 'மாவட்டம் அல்லது தொகுதி...' : 'Search district or constituency...'}
          placeholderTextColor="rgba(236,253,245,0.4)"
          value={searchQuery}
          onChangeText={t => { setSearchQuery(t); setShowSuggestions(true); }}
          onFocus={() => { setShowSuggestions(true); setActiveInput(true); }}
          onBlur={() => setActiveInput(false)}
          returnKeyType="search"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={handleClearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={COLORS.gold} />
          </TouchableOpacity>
        ) : (
          <Ionicons name="map-outline" size={18} color={COLORS.textSecondary} />
        )}
      </View>

      {/* Autocomplete dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={[styles.dropdown, { backgroundColor: COLORS.cardBg, borderColor: COLORS.goldBorderSoft }]}>
          <FlatList
            data={suggestions}
            keyExtractor={(item, idx) => `${item.type}-${item.name}-${idx}`}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.dropdownItem, { borderBottomColor: 'rgba(212,175,55,0.08)' }]}
                onPress={() => handleSelectSuggestion(item)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={item.type === 'district' ? 'location' : 'pin'}
                  size={16}
                  color={COLORS.gold}
                  style={{ marginRight: 10 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dropdownItemName, { color: COLORS.textPrimary }]}>{item.name}</Text>
                  <Text style={[styles.dropdownItemSub, { color: COLORS.textSecondary }]}>{item.subtitle}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* ── Soil Filter Pills ── */}
      <View style={styles.filterScrollWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={styles.filterScroll}
        >
          {soilFilters.map(f => {
            const active = activeSoilFilter === f.value;
            return (
              <TouchableOpacity
                key={f.label || 'all'}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: active ? f.color : 'rgba(3,53,33,0.4)',
                    borderColor: active ? f.color : COLORS.goldBorderSoft,
                  }
                ]}
                onPress={() => setActiveSoilFilter(f.value)}
                activeOpacity={0.8}
              >
                {!active && <View style={[styles.filterDot, { backgroundColor: f.color }]} />}
                <Text style={[styles.filterText, { color: active ? COLORS.textDark : COLORS.textPrimary }]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Map Container ── */}
      <View style={styles.mapContainer}>
        {MapView && (
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            initialRegion={TN_REGION}
            mapType={isSatellite ? 'satellite' : 'standard'}
            minZoomLevel={6.5}
            maxZoomLevel={16}
            showsUserLocation={false}
            showsCompass={true}
            showsScale={true}
            rotateEnabled={false}
            onPress={handleMapPress}
          >
            {filteredDistricts.map(district => {
              const isSelected = selectedDistrict?.id === district.id;
              const markerColor = SOIL_COLORS[district.soilType] || '#4CAF50';
              return (
                <Marker
                  key={district.id}
                  coordinate={{ latitude: district.latitude, longitude: district.longitude }}
                  onPress={() => openSheet(district)}
                  anchor={{ x: 0.5, y: 0.5 }}
                  title={isTamil ? district.tamilName : district.name}
                  pinColor={markerColor}
                >
                  <View style={styles.markerWrapper}>
                    <View style={[
                      styles.markerOuter,
                      {
                        backgroundColor: markerColor,
                        borderColor: isSelected ? COLORS.goldGlow : 'rgba(255,255,255,0.9)',
                        width: isSelected ? 22 : 16,
                        height: isSelected ? 22 : 16,
                        borderRadius: isSelected ? 11 : 8,
                        borderWidth: isSelected ? 2.5 : 1.5,
                        elevation: isSelected ? 8 : 3,
                      }
                    ]}>
                      {isSelected && <View style={styles.markerInnerSelected} />}
                    </View>
                    <View style={[
                      styles.markerLabelContainer, 
                      isSelected && { backgroundColor: COLORS.gold, borderColor: '#FFF', zIndex: 10 }
                    ]}>
                      <Text style={[
                        styles.markerLabelText, 
                        isSelected && { color: '#000' }
                      ]}>
                        {isTamil ? district.tamilName : district.name}
                      </Text>
                    </View>
                  </View>
                </Marker>
              );
            })}
          </MapView>
        )}

        {/* Floating Satellite View Toggle Button */}
        <TouchableOpacity
          style={[styles.countBadge, { left: 16, right: undefined, backgroundColor: COLORS.darkBg, borderColor: COLORS.goldBorderSoft, borderWidth: 1 }]}
          onPress={() => setIsSatellite(!isSatellite)}
          activeOpacity={0.8}
        >
          <Text style={[styles.countBadgeText, { color: COLORS.gold, fontWeight: '700' }]}>
            {isSatellite ? '🛰️ Satellite' : '🗺️ Street Map'}
          </Text>
        </TouchableOpacity>

        {/* District count badge */}
        <View style={[styles.countBadge, { backgroundColor: cardBg, borderColor: COLORS.glassBorder }]}>
          <Text style={[styles.countBadgeText, { color: cardText }]}>
            {filteredDistricts.length} {isTamil ? 'மாவட்டங்கள் / ஊர்கள்' : 'Districts & Towns'}
          </Text>
        </View>

        {/* Zoom hint */}
        {!selectedDistrict && (
          <View style={[styles.hintBubble, { backgroundColor: 'rgba(2,26,14,0.85)', borderColor: COLORS.goldBorderSoft, borderWidth: 0.8 }]}>
            <Text style={styles.hintText}>
              {isTamil ? '📍 வரைபடத்தில் எங்கு தட்டினாலும் மண் விவரம் தெரிய வரும்' : '📍 Tap anywhere on map or markers to inspect land'}
            </Text>
          </View>
        )}
      </View>

      {/* ── Legend Bar ── */}
      <View style={[styles.legendBar, { backgroundColor: cardBg, borderColor: COLORS.glassBorder }]}>
        {Object.entries(SOIL_COLORS).map(([type, color]) => (
          <View key={type} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={[styles.legendText, { color: COLORS.textSecondary }]}>
              {type.replace(' Soil', '')}
            </Text>
          </View>
        ))}
      </View>

      {/* ── Bottom Sheet ── */}
      <Animated.View
        style={[
          styles.bottomSheet,
          { backgroundColor: COLORS.cardBg, borderColor: COLORS.goldBorderSoft, borderTopWidth: 1, transform: [{ translateY: sheetAnim }] }
        ]}
        pointerEvents={selectedDistrict ? 'auto' : 'none'}
      >
        {/* Sheet Handle */}
        <View style={styles.sheetHandleRow}>
          <View style={styles.sheetHandle} />
          <TouchableOpacity style={styles.closeButton} onPress={closeSheet}>
            <Ionicons name="close" size={20} color={cardText} />
          </TouchableOpacity>
        </View>

        {selectedDistrict && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <View style={[styles.soilColorStripe, { backgroundColor: SOIL_COLORS[selectedDistrict.soilType] || '#4CAF50' }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.districtName, { color: cardText }]}>
                  {selectedDistrict.name}
                  {selectedDistrict.isHillStation ? ' 🏔️' : ''}
                </Text>
                <Text style={[styles.districtTamil, { color: secondaryText }]}>
                  {selectedDistrict.tamilName}
                </Text>
              </View>
              <View style={[styles.soilTypeBadge, { backgroundColor: SOIL_COLORS[selectedDistrict.soilType] + '22', borderColor: SOIL_COLORS[selectedDistrict.soilType] }]}>
                <Text style={[styles.soilTypeBadgeText, { color: SOIL_COLORS[selectedDistrict.soilType] }]}>
                  {selectedDistrict.soilType}
                </Text>
              </View>
            </View>

            {selectedDistrict.isHillStation && (
              <View style={[styles.hillBanner, { backgroundColor: 'rgba(4,106,56,0.2)', borderColor: dividerColor }]}>
                <Text style={[styles.hillBannerText, { color: cardText }]}>
                  🏔️ {selectedDistrict.hillStationDetail}
                </Text>
              </View>
            )}

            {(selectedDistrict.uniqueness || selectedDistrict.heritage) && (
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.sectionLabel, { color: COLORS.gold }]}>
                  ✨ {isTamil ? 'நிலத்தின் தனித்துவம் மற்றும் வேளாண் பாரம்பரியம்' : 'Land Uniqueness & Agricultural Heritage'}
                </Text>
                {selectedDistrict.uniqueness && (
                  <View style={{ marginBottom: 8, padding: 12, borderRadius: 12, backgroundColor: 'rgba(212,175,55,0.08)', borderWidth: 1, borderColor: COLORS.goldBorderSoft }}>
                    <Text style={{ fontSize: 13, color: COLORS.textPrimary, fontWeight: '600', lineHeight: 18 }}>
                      🌱 {isTamil ? selectedDistrict.uniquenessTamil : selectedDistrict.uniqueness}
                    </Text>
                  </View>
                )}
                {selectedDistrict.heritage && (
                  <View style={{ padding: 12, borderRadius: 12, backgroundColor: 'rgba(16,185,129,0.08)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' }}>
                    <Text style={{ fontSize: 13, color: COLORS.textPrimary, fontWeight: '600', lineHeight: 18 }}>
                      🏛️ {isTamil ? selectedDistrict.heritageTamil : selectedDistrict.heritage}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* NPK Section */}
            <Text style={[styles.sectionLabel, { color: cardText }]}>
              📊 {isTamil ? 'மண் சத்துக்கள் (N-P-K)' : 'Avg. Soil Nutrients (N-P-K)'}
            </Text>
            {[
              { key: isTamil ? 'நைட்ரஜன் (N)' : 'Nitrogen (N)',    val: selectedDistrict.N, max: maxN, color: npkColors.N },
              { key: isTamil ? 'பாஸ்பரஸ் (P)' : 'Phosphorus (P)',  val: selectedDistrict.P, max: maxP, color: npkColors.P },
              { key: isTamil ? 'பொட்டாசியம் (K)': 'Potassium (K)',  val: selectedDistrict.K, max: maxK, color: npkColors.K },
            ].map(({ key, val, max, color }) => (
              <View key={key} style={styles.npkRow}>
                <Text style={[styles.npkLabel, { color: COLORS.textSecondary }]}>{key}</Text>
                <View style={[styles.npkBarBg, { backgroundColor: COLORS.darkBg }]}>
                  <View style={[styles.npkBarFill, { width: `${Math.min((val / max) * 100, 100)}%`, backgroundColor: color }]} />
                </View>
                <Text style={[styles.npkValue, { color: COLORS.textPrimary }]}>{val}</Text>
              </View>
            ))}

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* Crops */}
            <Text style={[styles.sectionLabel, { color: cardText }]}>
              🌾 {isTamil ? 'பரிந்துரைக்கப்பட்ட பயிர்கள்' : 'Recommended Crops'}
            </Text>
            {selectedDistrict.topCrops.length > 0 ? (
              <View style={styles.cropsRow}>
                {selectedDistrict.topCrops.map((crop, i) => (
                  <View key={crop} style={[styles.cropChip, { backgroundColor: cardBg2, borderColor: dividerColor }]}>
                    <Text style={styles.cropRank}>#{i + 1}</Text>
                    <Text style={[styles.cropName, { color: cardText }]}>{crop}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.noCropText, { color: secondaryText }]}>
                {isTamil ? 'நகரப் பகுதி — தரவு இல்லை.' : 'Urban area — no crop data.'}
              </Text>
            )}

            <View style={{ marginTop: 24 }}>
              <TouchableOpacity onPress={handleAnalyzeInPlanner} activeOpacity={0.85}>
                <View style={[styles.actionBtn, { backgroundColor: COLORS.gold }]}>
                  <MaterialIcons name="analytics" size={20} color={COLORS.textDark} />
                  <Text style={styles.actionBtnText}>
                    {isTamil ? 'பயிர் திட்டமிடலுக்கு செல்' : 'Analyze in Crop Planner'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </Animated.View>

      {/* Backdrop tap to close */}
      {selectedDistrict && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={closeSheet}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // ─── Search ───
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    zIndex: 200,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    padding: 0,
    outlineStyle: 'none',
  } as any,
  dropdown: {
    position: 'absolute',
    top: 78,
    left: 16,
    right: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    maxHeight: 260,
    zIndex: 300,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dropdownItemName: {
    fontSize: 15,
    fontWeight: '600',
  },
  dropdownItemSub: {
    fontSize: 12,
    marginTop: 1,
  },
  // ─── Filters ───
  filterScrollWrapper: {
    height: 40,
    marginBottom: 8,
    zIndex: 100,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    gap: 6,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  // ─── Map ───
  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.goldBorderSoft,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  countBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    elevation: 4,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  hintBubble: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  hintText: {
    color: COLORS.textGold,
    fontSize: 12,
    fontWeight: '600',
  },
  markerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerOuter: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  markerInnerSelected: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4AF37',
  },
  markerLabelContainer: {
    position: 'absolute',
    top: -25,
    backgroundColor: 'rgba(3,53,33,0.95)',
    borderWidth: 0.5,
    borderColor: COLORS.goldBorderSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    width: 100,
    alignItems: 'center',
  },
  markerLabelText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // ─── Legend ───
  legendBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // ─── Bottom Sheet ───
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: BOTTOM_SHEET_HEIGHT,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: 20,
    paddingTop: 8,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    zIndex: 10,
  },
  sheetHandleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  sheetHandle: {
    width: 48,
    height: 5,
    backgroundColor: 'rgba(212,175,55,0.3)',
    borderRadius: 2.5,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    padding: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  soilColorStripe: {
    width: 5,
    height: 52,
    borderRadius: 3,
  },
  districtName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  districtTamil: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  soilTypeBadge: {
    borderWidth: 0.5,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 'auto',
  },
  soilTypeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  hillBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginBottom: 12,
  },
  hillBannerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 14,
    borderRadius: 1,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.1,
  },
  // ─── NPK ───
  npkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  npkLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 108,
  },
  npkBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  npkBarFill: {
    height: 8,
    borderRadius: 4,
  },
  npkValue: {
    fontSize: 12,
    fontWeight: '700',
    width: 36,
    textAlign: 'right',
  },
  // ─── Crops ───
  cropsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cropChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    gap: 6,
  },
  cropRank: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textGold,
  },
  cropName: {
    fontSize: 13,
    fontWeight: '600',
  },
  noCropText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    ...SHADOWS.button,
  },
  actionBtnText: {
    color: COLORS.textDark,
    fontWeight: 'bold',
    fontSize: 15,
  },
});

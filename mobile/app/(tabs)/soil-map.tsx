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
import { MapView, Marker as RNMarker, PROVIDER_DEFAULT } from '../../components/MapComponent';
const Marker = RNMarker as any; // Cast to any — web component accepts extra props (size, borderColor, label)
import { useApp } from '../_layout';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { DISTRICT_SOIL_DATA, DistrictSoilInfo } from '../../constants/soilData';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, SHADOWS, RADIUS, SPACING } from '../../constants/theme';
import AgriBackground from '../../components/AgriBackground';

import cropDataRaw from '../../assets/crop_suggestion.json';
import coordsDataRaw from '../../assets/constituency_coords.json';

interface CropSuggestion {
  "Constituency Name": string;
  "District": string;
  "Crop 1": string;
  "Crop 2": string;
  "Crop 3": string;
}

const cropData = cropDataRaw as CropSuggestion[];
const coordsData = coordsDataRaw as Record<string, {lat: number, lon: number}>;

import cropNpkRaw from '../../assets/crop_npk_reqs.json';
const CROP_NPK = cropNpkRaw as Record<string, { N: number; P: number; K: number }>;

// ─── Fertilizer Cost Calculator ───────────────────────────────────
const calculateFertilizerCost = (soilN: number, soilP: number, soilK: number, cropN: number, cropP: number, cropK: number) => {
    let cost = 0;
    const pDeficit = Math.max(0, cropP - soilP);
    const dapNeededKg = pDeficit / 0.46;
    cost += dapNeededKg * 27;
    const nFromDap = dapNeededKg * 0.18;
    const nDeficit = Math.max(0, cropN - (soilN + nFromDap));
    const ureaNeededKg = nDeficit / 0.46;
    cost += ureaNeededKg * 6.6;
    const kDeficit = Math.max(0, cropK - soilK);
    const mopNeededKg = kDeficit / 0.60;
    cost += mopNeededKg * 34;
    return {
       totalCost: Math.round(cost),
       urea: Math.round(ureaNeededKg),
       dap: Math.round(dapNeededKg),
       mop: Math.round(mopNeededKg),
       nDeficit: Math.round(nDeficit),
       pDeficit: Math.round(pDeficit),
       kDeficit: Math.round(kDeficit)
    };
};

// ─── All crops from dataset ───────────────────────────────────────
const ALL_SUITABILITY_CROPS = Array.from(new Set(
  cropData.flatMap(c => [c['Crop 1'], c['Crop 2'], c['Crop 3']]).filter(Boolean)
)).sort();

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SOIL_COLORS: Record<string, string> = {
  'Red Soil':     '#D32F2F',
  'Black Soil':   '#424242',
  'Alluvial Soil':'#D4AF37',
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
  const [selectedConstituency, setSelectedConstituency] = useState<any>(null);
  const [selectedSuitabilityCrop, setSelectedSuitabilityCrop] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<'soil' | 'suitability' | 'cost'>('soil');

  const handleMapPress = () => {
    closeSheet();
  };

  // Bottom sheet animation
  const sheetAnim = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;
  const sheetVisible = useRef(false);

  const mapRef = useRef<any>(null);

  const openSheet = useCallback((constituency: any, district: DistrictSoilInfo | undefined) => {
    setSelectedConstituency(constituency);
    if (district) setSelectedDistrict(district);
    sheetVisible.current = true;
    Animated.spring(sheetAnim, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
    if (mapRef.current && district) {
      mapRef.current.animateToRegion(
        {
          latitude: district.latitude,
          longitude: district.longitude,
          latitudeDelta: 0.8,
          longitudeDelta: 0.8,
        },
        500
      );
    }
  }, [sheetAnim]);

  const closeSheet = useCallback(() => {
    Animated.timing(sheetAnim, {
      toValue: BOTTOM_SHEET_HEIGHT,
      duration: 280,
      useNativeDriver: true,
    }).start(() => {
      sheetVisible.current = false;
      setSelectedConstituency(null);
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
      const firstConst = cropData.find(c => c.District.toLowerCase() === d.name.toLowerCase());
      if (firstConst) openSheet(firstConst, d);
    } else {
      const c = suggestion.data as CropSuggestion;
      const d = DISTRICT_SOIL_DATA.find(dist => dist.name.toLowerCase() === c.District.toLowerCase());
      setSearchQuery(`${c['Constituency Name']} (${isTamil && d ? d.tamilName : c.District})`);
      openSheet(c, d);
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
    if (selectedConstituency) {
      router.push({ pathname: '/farm', params: { query: selectedConstituency['Constituency Name'] } });
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

  // Count visible constituencies
  const visibleCount = useMemo(() => {
    return cropData.filter(c => {
      const d = DISTRICT_SOIL_DATA.find(dist => dist.name.toLowerCase() === c.District.toLowerCase());
      if (activeSoilFilter && d?.soilType !== activeSoilFilter) return false;
      return true;
    }).length;
  }, [activeSoilFilter]);

  // ─── Best Crop Finder ───────────────────────────────────────────
  const bestCropsForLocation = useMemo(() => {
    if (!selectedDistrict) return [];
    const results: Array<{ crop: string; cost: number; urea: number; dap: number; mop: number }> = [];
    for (const [cropKey, reqs] of Object.entries(CROP_NPK)) {
      const costData = calculateFertilizerCost(
        selectedDistrict.N, selectedDistrict.P, selectedDistrict.K,
        reqs.N, reqs.P, reqs.K
      );
      // Only include crops that are actually in the suitability list
      const cropName = ALL_SUITABILITY_CROPS.find(c => c.toLowerCase() === cropKey);
      if (cropName) {
        results.push({
          crop: cropName,
          cost: costData.totalCost,
          urea: costData.urea,
          dap: costData.dap,
          mop: costData.mop,
        });
      }
    }
    return results.sort((a, b) => a.cost - b.cost).slice(0, 5);
  }, [selectedDistrict]);

  // Constants theme values
  const cardBg        = COLORS.glassCard;
  const cardBg2       = 'rgba(4,106,56,0.3)';
  const cardText      = COLORS.textPrimary;
  const secondaryText = COLORS.textSecondary;
  const dividerColor  = 'rgba(212,175,55,0.15)';

  // N-P-K progress color
  const npkColors = { N: '#E65100', P: '#D4AF37', K: '#10B981' };
  const maxN = 150, maxP = 80, maxK = 350;

  // ─── Dynamic Legend Items ─────────────────────────────────────────
  const legendItems = useMemo(() => {
    if (selectedSuitabilityCrop && mapMode === 'suitability') {
      return [
        { color: '#00E676', label: isTamil ? 'பொருத்தமான' : 'Suitable' },
        { color: '#888888', label: isTamil ? 'பொருத்தமில்லாத' : 'Not Suitable' },
      ];
    }
    if (selectedSuitabilityCrop && mapMode === 'cost') {
      return [
        { color: '#00E676', label: isTamil ? 'குறைவு (<₹1K)' : 'Low Cost (<₹1K)' },
        { color: '#FFD700', label: isTamil ? 'நடுத்தரம்' : 'Medium (₹1K-3K)' },
        { color: '#FF5252', label: isTamil ? 'அதிகம் (>₹3K)' : 'High Cost (>₹3K)' },
      ];
    }
    return Object.entries(SOIL_COLORS).map(([type, color]) => ({
      color,
      label: type.replace(' Soil', ''),
    }));
  }, [selectedSuitabilityCrop, mapMode, isTamil]);

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

      {/* ── Map Mode Toggle ── */}
      <View style={styles.modeToggleContainer}>
        <TouchableOpacity
          style={[styles.modeToggleBtn, mapMode === 'suitability' && styles.modeToggleActive]}
          onPress={() => setMapMode('suitability')}
          activeOpacity={0.8}
        >
          <Text style={[styles.modeToggleText, mapMode === 'suitability' && { color: COLORS.textDark }]}>
            {isTamil ? '🌱 பயிர் பொருத்தம்' : '🌱 Crop Suitability'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeToggleBtn, mapMode === 'cost' && styles.modeToggleActive]}
          onPress={() => setMapMode('cost')}
          activeOpacity={0.8}
        >
          <Text style={[styles.modeToggleText, mapMode === 'cost' && { color: COLORS.textDark }]}>
            {isTamil ? '💰 உரச் செலவு' : '💰 Fertilizer Cost'}
          </Text>
        </TouchableOpacity>
      </View>

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

      {/* ── Crop Selection Pills ── */}
      <View style={[styles.filterScrollWrapper, { marginTop: 5, marginBottom: 15 }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={styles.filterScroll}
        >
          <TouchableOpacity
            style={[
              styles.filterPill,
              {
                backgroundColor: !selectedSuitabilityCrop ? COLORS.gold : 'rgba(3,53,33,0.4)',
                borderColor: !selectedSuitabilityCrop ? COLORS.gold : COLORS.goldBorderSoft,
              }
            ]}
            onPress={() => setSelectedSuitabilityCrop(null)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, { color: !selectedSuitabilityCrop ? COLORS.textDark : COLORS.textPrimary }]}>
              {isTamil ? 'அனைத்து பயிர்கள்' : (mapMode === 'cost' ? 'Select a Crop for Cost Prediction' : 'All Crops (Soil View)')}
            </Text>
          </TouchableOpacity>
          {ALL_SUITABILITY_CROPS.map(crop => {
            const active = selectedSuitabilityCrop === crop;
            return (
              <TouchableOpacity
                key={crop}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: active ? '#00E676' : 'rgba(3,53,33,0.4)',
                    borderColor: active ? '#00E676' : COLORS.goldBorderSoft,
                  }
                ]}
                onPress={() => setSelectedSuitabilityCrop(crop)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterText, { color: active ? COLORS.textDark : COLORS.textPrimary }]}>
                  {crop}
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
            {cropData.map((c, idx) => {
              const coords = coordsData[c['Constituency Name']];
              if (!coords) return null;
              
              const district = DISTRICT_SOIL_DATA.find(dist => dist.name.toLowerCase() === c.District.toLowerCase());
              if (activeSoilFilter && district?.soilType !== activeSoilFilter) return null;
              
              // ── Compute marker color, size, border ──
              let markerColor = district ? SOIL_COLORS[district.soilType] : '#4CAF50';
              let markerSize = 12;
              let markerBorder = 'rgba(255,255,255,0.7)';
              let zIndex = 1;
              let tooltipLabel = c['Constituency Name'];
              
              if (selectedSuitabilityCrop) {
                if (mapMode === 'suitability') {
                  const hasCrop = [c['Crop 1'], c['Crop 2'], c['Crop 3']].includes(selectedSuitabilityCrop);
                  if (hasCrop) {
                    markerColor = '#00E676';
                    markerSize = 16;
                    markerBorder = '#FFFFFF';
                    zIndex = 10;
                    tooltipLabel = `${c['Constituency Name']} ✅ ${selectedSuitabilityCrop}`;
                  } else {
                    markerColor = '#888888';
                    markerSize = 8;
                    markerBorder = 'rgba(255,255,255,0.3)';
                    zIndex = 1;
                  }
                } else if (mapMode === 'cost') {
                  const reqKey = selectedSuitabilityCrop.toLowerCase();
                  if (CROP_NPK[reqKey] && district) {
                    const req = CROP_NPK[reqKey];
                    const costData = calculateFertilizerCost(district.N, district.P, district.K, req.N, req.P, req.K);
                    if (costData.totalCost < 1000) {
                      markerColor = '#00E676';
                      markerSize = 16;
                      markerBorder = '#FFFFFF';
                      zIndex = 10;
                      tooltipLabel = `${c['Constituency Name']} — ₹${costData.totalCost}/acre`;
                    } else if (costData.totalCost < 3000) {
                      markerColor = '#FFD700';
                      markerSize = 14;
                      markerBorder = '#FFFFFF';
                      zIndex = 5;
                      tooltipLabel = `${c['Constituency Name']} — ₹${costData.totalCost}/acre`;
                    } else {
                      markerColor = '#FF5252';
                      markerSize = 14;
                      markerBorder = '#FFFFFF';
                      zIndex = 5;
                      tooltipLabel = `${c['Constituency Name']} — ₹${costData.totalCost}/acre`;
                    }
                  } else {
                    markerColor = '#555555';
                    markerSize = 6;
                    markerBorder = 'rgba(255,255,255,0.2)';
                    zIndex = 0;
                  }
                }
              }

              const isSelected = selectedConstituency?.['Constituency Name'] === c['Constituency Name'];
              if (isSelected) {
                markerSize = 22;
                markerBorder = COLORS.goldGlow;
                zIndex = 100;
              }
              
              return (
                <Marker
                  key={`${c['Constituency Name']}-${idx}`}
                  coordinate={{ latitude: coords.lat, longitude: coords.lon }}
                  color={markerColor}
                  size={markerSize}
                  borderColor={markerBorder}
                  label={tooltipLabel}
                  zIndex={zIndex}
                  onPress={() => openSheet(c, district)}
                  anchor={{ x: 0.5, y: 0.5 }}
                />
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
            {visibleCount} {isTamil ? 'தொகுதிகள் / ஊர்கள்' : 'Constituencies & Towns'}
          </Text>
        </View>

        {/* Zoom hint */}
        {!selectedDistrict && (
          <View style={[styles.hintBubble, { backgroundColor: 'rgba(2,26,14,0.85)', borderColor: COLORS.goldBorderSoft, borderWidth: 0.8 }]}>
            <Text style={styles.hintText}>
              {isTamil ? '📍 வரைபடத்தில் எங்கு தட்டினாலும் மண் விவரம் தெரிய வரும்' : '📍 Tap anywhere on map to inspect land'}
            </Text>
          </View>
        )}
      </View>

      {/* ── Dynamic Legend Bar ── */}
      <View style={[styles.legendBar, { backgroundColor: cardBg, borderColor: COLORS.glassBorder }]}>
        {legendItems.map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={[styles.legendText, { color: COLORS.textSecondary }]}>
              {item.label}
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
        pointerEvents={selectedConstituency ? 'auto' : 'none'}
      >
        {/* Sheet Handle */}
        <View style={styles.sheetHandleRow}>
          <View style={styles.sheetHandle} />
          <TouchableOpacity style={styles.closeButton} onPress={closeSheet}>
            <Ionicons name="close" size={20} color={cardText} />
          </TouchableOpacity>
        </View>

        {selectedConstituency && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <View style={[styles.soilColorStripe, { backgroundColor: selectedDistrict ? (SOIL_COLORS[selectedDistrict.soilType] || '#4CAF50') : '#4CAF50' }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.districtName, { color: cardText }]}>
                  {selectedConstituency['Constituency Name']}
                  {selectedDistrict?.isHillStation ? ' 🏔️' : ''}
                </Text>
                <Text style={[styles.districtTamil, { color: secondaryText }]}>
                  {selectedConstituency.District} {isTamil ? 'மாவட்டம்' : 'District'}
                </Text>
              </View>
              {selectedDistrict && (
                <View style={[styles.soilTypeBadge, { backgroundColor: SOIL_COLORS[selectedDistrict.soilType] + '22', borderColor: SOIL_COLORS[selectedDistrict.soilType] }]}>
                  <Text style={[styles.soilTypeBadgeText, { color: SOIL_COLORS[selectedDistrict.soilType] }]}>
                    {selectedDistrict.soilType}
                  </Text>
                </View>
              )}
            </View>

            {selectedDistrict?.isHillStation && (
              <View style={[styles.hillBanner, { backgroundColor: 'rgba(4,106,56,0.2)', borderColor: dividerColor }]}>
                <Text style={[styles.hillBannerText, { color: cardText }]}>
                  🏔️ {selectedDistrict.hillStationDetail}
                </Text>
              </View>
            )}

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* NPK Section */}
            {selectedDistrict && (
              <>
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
              </>
            )}

            {/* Cost Predictor breakdown */}
            {mapMode === 'cost' && selectedSuitabilityCrop && selectedDistrict && (() => {
              const reqKey = selectedSuitabilityCrop.toLowerCase();
              if (!CROP_NPK[reqKey]) return null;
              const req = CROP_NPK[reqKey];
              const costData = calculateFertilizerCost(selectedDistrict.N, selectedDistrict.P, selectedDistrict.K, req.N, req.P, req.K);
              
              return (
                <View style={{ backgroundColor: 'rgba(212,175,55,0.05)', padding: 12, borderRadius: RADIUS.md, marginBottom: 16, borderWidth: 1, borderColor: COLORS.goldBorderSoft }}>
                  <Text style={[styles.sectionLabel, { color: COLORS.gold, marginBottom: 12 }]}>
                    💰 {isTamil ? 'உரச் செலவு கணிப்பு' : 'Estimated Fertilizer Cost'} ({selectedSuitabilityCrop})
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>{isTamil ? 'யூரியா தேவை' : 'Urea Needed'}:</Text>
                    <Text style={{ color: COLORS.textPrimary, fontWeight: '600' }}>{costData.urea} kg</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>{isTamil ? 'DAP தேவை' : 'DAP Needed'}:</Text>
                    <Text style={{ color: COLORS.textPrimary, fontWeight: '600' }}>{costData.dap} kg</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>{isTamil ? 'MOP தேவை' : 'MOP Needed'}:</Text>
                    <Text style={{ color: COLORS.textPrimary, fontWeight: '600' }}>{costData.mop} kg</Text>
                  </View>
                  <View style={[styles.divider, { backgroundColor: dividerColor, marginVertical: 8 }]} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: COLORS.textPrimary, fontSize: 14, fontWeight: '600' }}>{isTamil ? 'மொத்தச் செலவு / ஏக்கர்' : 'Total Cost / Acre'}:</Text>
                    <Text style={{ color: costData.totalCost > 3000 ? '#FF5252' : '#4CAF50', fontSize: 18, fontWeight: 'bold' }}>
                      ₹{costData.totalCost.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>
              );
            })()}

            {/* Recommended Crops */}
            <Text style={[styles.sectionLabel, { color: cardText }]}>
              🌾 {isTamil ? 'பரிந்துரைக்கப்பட்ட பயிர்கள்' : 'Recommended Crops'}
            </Text>
            {(() => {
              const crops = [selectedConstituency['Crop 1'], selectedConstituency['Crop 2'], selectedConstituency['Crop 3']].filter(Boolean);
              return crops.length > 0 ? (
                <View style={styles.cropsRow}>
                  {crops.map((crop, i) => (
                    <View key={`${crop}-${i}`} style={[styles.cropChip, { backgroundColor: cardBg2, borderColor: dividerColor }]}>
                      <Text style={styles.cropRank}>#{i + 1}</Text>
                      <Text style={[styles.cropName, { color: cardText }]}>{crop}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={[styles.noCropText, { color: secondaryText }]}>
                  {isTamil ? 'நகரப் பகுதி — தரவு இல்லை.' : 'Urban area — no crop data.'}
                </Text>
              );
            })()}

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* ── Best Crop Finder ── */}
            {selectedDistrict && bestCropsForLocation.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: COLORS.gold }]}>
                  🔍 {isTamil ? 'குறைந்த உரச் செலவு பயிர்கள்' : 'Cheapest Crops to Grow Here'}
                </Text>
                <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginBottom: 12, marginTop: -6 }}>
                  {isTamil ? 'இந்த மண்ணுக்கு குறைந்த உரச் செலவு' : 'Based on local soil nutrients — lowest fertilizer expense'}
                </Text>
                {bestCropsForLocation.map((item, i) => (
                  <View key={item.crop} style={[styles.bestCropRow, { borderColor: i === 0 ? '#00E676' : dividerColor }]}>
                    <View style={[styles.bestCropRankBadge, { backgroundColor: i === 0 ? '#00E676' : i < 3 ? '#FFD700' : '#888' }]}>
                      <Text style={{ color: '#000', fontWeight: '900', fontSize: 12 }}>#{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: COLORS.textPrimary, fontWeight: '700', fontSize: 14 }}>{item.crop}</Text>
                      <Text style={{ color: COLORS.textSecondary, fontSize: 11 }}>
                        {isTamil ? 'யூரியா' : 'Urea'}: {item.urea}kg • DAP: {item.dap}kg • MOP: {item.mop}kg
                      </Text>
                    </View>
                    <Text style={{ color: item.cost < 1000 ? '#00E676' : item.cost < 3000 ? '#FFD700' : '#FF5252', fontWeight: 'bold', fontSize: 15 }}>
                      ₹{item.cost.toLocaleString('en-IN')}
                    </Text>
                  </View>
                ))}
                <View style={[styles.divider, { backgroundColor: dividerColor }]} />
              </>
            )}

            {/* Action Button */}
            <View style={{ marginTop: 8 }}>
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
      {selectedConstituency && (
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
  modeToggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(2,26,14,0.6)',
    borderRadius: RADIUS.md,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  modeToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  modeToggleActive: {
    backgroundColor: COLORS.gold,
  },
  modeToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
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
  // ─── Best Crop Finder ───
  bestCropRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: 10,
    borderRadius: RADIUS.sm,
    marginBottom: 8,
    borderWidth: 1,
    gap: 10,
  },
  bestCropRankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
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
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, ImageBackground, Alert, Image, TextInput, FlatList, Modal, Animated, Easing } from 'react-native';
import FloatingLeafLoader from '../../components/FloatingLeafLoader';

import { useApp } from '../_layout';
import { useAuth } from '../_context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL, authFetch, fetchWithTimeout } from '../_api/config';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import AgriBackground from '../../components/AgriBackground';

import tradeData from '../../assets/trade_data.json';
const uniqueCrops = Array.from(new Set(tradeData.map((item: any) => item.crop))).sort();

type ScanResult = {
  id: string;
  status: string;
  description: string;
  image_url: string;
  created_at: string;
  confidence?: number;
  severity?: 'Healthy' | 'Mild' | 'Moderate' | 'Severe' | 'None' | 'Unknown';
  disease_name?: string;
  organic_remedy?: string;
  chemical_remedy?: string;
};


export default function GrowthScreen() {
  const { isTamil } = useApp();
  const { isAuthenticated } = useAuth();
  const [isOrganic, setIsOrganic] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<{
    status: string;
    description: string;
    confidence: number;
    severity: 'Healthy' | 'Mild' | 'Moderate' | 'Severe' | 'None' | 'Unknown';
    disease_name?: string;
    organic_remedy?: string;
    chemical_remedy?: string;
  } | null>(null);

  // Leaf loader animation
  const leafAnim = useRef(new Animated.Value(0)).current;
  const leafRotate = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isAnalyzing) {
      progressAnim.setValue(0);
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(leafAnim, { toValue: -14, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
          Animated.timing(leafAnim, { toValue: 4, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(leafRotate, { toValue: 1, duration: 1800, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
          Animated.timing(leafRotate, { toValue: -1, duration: 1800, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        ])
      ).start();
    } else {
      leafAnim.stopAnimation();
      leafRotate.stopAnimation();
    }
  }, [isAnalyzing]);

  const leafRotateDeg = leafRotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-20deg', '20deg'],
  });
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '90%'],
  });


  const [acres, setAcres] = useState('1');
  const [selectedCrop, setSelectedCrop] = useState('Paddy');
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [cropSearch, setCropSearch] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcResult, setCalcResult] = useState<string | null>(null);
  const [activeInput, setActiveInput] = useState<string | null>(null);

  const filteredCrops = uniqueCrops.filter((c: any) => c.toLowerCase().includes(cropSearch.toLowerCase()));

  // Scan history
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // ── Load scan history ─────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingHistory(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/ml/crop-scans`);
      if (response.ok) {
        const data = await response.json();
        setScanHistory(data);
      }
    } catch (e) {
      console.error('[Growth] Failed to load scan history:', e);
    } finally {
      setLoadingHistory(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // ── Process image ──
  const processImage = async (base64Img: string, uri: string) => {
    setImageUri(uri);
    setScanResult(null);
    setIsAnalyzing(true);
    try {
      let responseData: any = {};

      if (isAuthenticated) {
        // Use the persistent endpoint that saves to DB
        const res = await authFetch(`${API_BASE_URL}/ml/crop-scans`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_base64: base64Img, is_tamil: isTamil }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || 'Server error');
        }

        responseData = await res.json();
        // Refresh history
        loadHistory();
      } else {
        // Fallback: non-authenticated snap-solve
        const res = await fetchWithTimeout(`${API_BASE_URL}/ml/snap-solve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_base64: base64Img, is_tamil: isTamil }),
        });

        if (!res.ok) throw new Error('Server error');
        const data = await res.json();
        responseData = data.reply || data;
      }
      
      console.log("Scan Response:", responseData);

      const confidenceValue = typeof responseData.confidence === 'number' 
          ? (responseData.confidence <= 1 ? Math.round(responseData.confidence * 100) : responseData.confidence)
          : 0;

      setScanResult({ 
        status: responseData.status, 
        description: responseData.description, 
        confidence: confidenceValue, 
        severity: responseData.severity || 'Unknown', 
        disease_name: responseData.disease_name || responseData.status, 
        organic_remedy: responseData.organic_remedy, 
        chemical_remedy: responseData.chemical_remedy 
      });
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        isTamil ? 'பிழை' : 'Analysis Error',
        err.message || (isTamil ? 'மன்னிக்கவும், பிழை ஏற்பட்டது.' : 'Error analyzing image. Ensure backend is running.'),
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateFertilizer = async (organicMode = isOrganic) => {
    setIsCalculating(true);
    const area = parseFloat(acres) || 1.0;
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/ml/fertilizer-guide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          land_size_acres: area,
          crop_name: selectedCrop,
          mode: organicMode ? 'organic' : 'chemical',
          is_tamil: isTamil,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to calculate');
      setCalcResult(data.recommendation);
    } catch (err: any) {
      if (organicMode) {
        setCalcResult(
          isTamil
            ? `**இயற்கை உரப் பரிந்துரை (${selectedCrop}):**\n• ஜீவாமிர்தம்: ${(area * 200).toFixed(1)} லிட்டர்\n• பஞ்சகவ்யா: ${(area * 10).toFixed(1)} லிட்டர்\n• வேப்பம் புண்ணாக்கு: ${(area * 300).toFixed(1)} கிலோ\n• மண்புழு உரம்: ${(area * 2300).toFixed(1)} கிலோ`
            : `**Organic Fertilizer Recommendation (${selectedCrop}):**\n• Jeevamrutham: ${(area * 200).toFixed(1)} L\n• Panchagavya: ${(area * 10).toFixed(1)} L\n• Neem Cake: ${(area * 300).toFixed(1)} kg\n• Vermicompost: ${(area * 2300).toFixed(1)} kg`
        );
      } else {
        setCalcResult(
          isTamil
            ? `**இரசாயன உரப் பரிந்துரை (${selectedCrop}):**\n• யூரியா (Urea): ${(area * 2.2).toFixed(1)} மூட்டை\n• டி.ஏ.பி (DAP): ${(area * 1.1).toFixed(1)} மூட்டை\n• பொட்டாஷ் (MOP): ${(area * 1.0).toFixed(1)} மூட்டை`
            : `**Chemical Fertilizer Recommendation (${selectedCrop}):**\n• Urea: ${(area * 2.2).toFixed(1)} bags\n• DAP: ${(area * 1.1).toFixed(1)} bags\n• MOP: ${(area * 1.0).toFixed(1)} bags`
        );
      }
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    if (calcResult !== null) {
      calculateFertilizer(isOrganic);
    }
  }, [isOrganic]);

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(isTamil ? 'கேமரா அணுகல் தேவை!' : 'Camera permission is required!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      processImage(result.assets[0].base64, result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(isTamil ? 'அனுமதி தேவை' : 'Permission Required', isTamil ? 'கேலரியை அணுக அனுமதி தேவை.' : 'Gallery access permission is required.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      processImage(result.assets[0].base64, result.assets[0].uri);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <AgriBackground />
      <View style={styles.overlay}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Crop Disease Scanner */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {isTamil ? 'இலை நோய் கண்டறிதல் 🌿' : 'Leaf Disease Scanner 🌿'}
              </Text>
              <Text style={styles.cardSubtitle}>
                {isTamil ? 'பாதிக்கப்பட்ட பயிர் இலையின் புகைப்படத்தை பதிவேற்றுங்கள்.' : 'Take a photo of the affected leaf to detect disease.'}
              </Text>

              {imageUri && (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                  {isAnalyzing && (
                    <View style={styles.analysingOverlay}>
                      {/* Floating leaf animation */}
                      <Animated.Text
                        style={[
                          styles.leafIcon,
                          {
                            transform: [
                              { translateY: leafAnim },
                              { rotate: leafRotateDeg },
                            ],
                          },
                        ]}
                      >
                        🍃
                      </Animated.Text>
                      <Text style={styles.analysingText}>
                        {isTamil ? 'ML மாதிரி மூலம் இலை பகுப்பாய்வு செய்கிறது...' : 'Analyzing leaf image with ML model...'}
                      </Text>
                      {/* Progress bar */}
                      <View style={styles.progressTrack}>
                        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
                      </View>
                    </View>
                  )}
                </View>
              )}

              {scanResult && (
                <View style={styles.resultContainer}>
                  {/* Disease name + severity badge */}
                  <View style={styles.resultHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resultStatusTitle}>
                        {isTamil ? 'நிலைமை / கண்டறிதல்:' : 'Disease Detection:'}
                      </Text>
                      <Text style={styles.resultStatus}>{scanResult.disease_name || scanResult.status}</Text>
                    </View>
                    <View style={[
                      styles.severityBadge,
                      scanResult.severity === 'Healthy' && styles.badgeHealthy,
                      scanResult.severity === 'Mild' && styles.badgeMild,
                      scanResult.severity === 'Moderate' && styles.badgeModerate,
                      scanResult.severity === 'Severe' && styles.badgeSevere,
                    ]}>
                      <Text style={styles.severityBadgeText}>{scanResult.severity}</Text>
                    </View>
                  </View>

                  {/* Confidence bar */}
                  {scanResult.confidence > 0 && (
                    <View style={styles.confidenceRow}>
                      <MaterialIcons name="analytics" size={14} color={COLORS.textGold} />
                      <Text style={styles.confidenceLabel}>
                        {isTamil ? 'நம்பகத்தன்மை:' : 'Confidence:'}
                      </Text>
                      <Text style={styles.confidenceValue}>{scanResult.confidence}%</Text>
                    </View>
                  )}
                  <View style={styles.confidenceTrack}>
                    <View style={[
                      styles.confidenceFill,
                      { width: `${scanResult.confidence}%` as any },
                      scanResult.severity === 'Healthy' && { backgroundColor: '#22c55e' },
                      scanResult.severity === 'Moderate' && { backgroundColor: '#f59e0b' },
                      scanResult.severity === 'Severe' && { backgroundColor: '#ef4444' },
                    ]} />
                  </View>

                  <View style={styles.resultDivider} />

                  {/* Recommendation / Remedy */}
                  {scanResult.organic_remedy && scanResult.chemical_remedy ? (
                    <View>
                      <View style={styles.remedyHeader}>
                        <MaterialIcons name="eco" size={14} color={COLORS.textGold} />
                        <Text style={styles.resultDescTitle}>
                          {isTamil ? 'இயற்கை தீர்வு:' : 'Organic Remedy:'}
                        </Text>
                      </View>
                      <Text style={styles.resultDesc}>{scanResult.organic_remedy}</Text>
                      <View style={[styles.remedyHeader, { marginTop: 8 }]}>
                        <MaterialIcons name="science" size={14} color={COLORS.textGold} />
                        <Text style={styles.resultDescTitle}>
                          {isTamil ? 'வேதியியல் தீர்வு:' : 'Chemical Remedy:'}
                        </Text>
                      </View>
                      <Text style={styles.resultDesc}>{scanResult.chemical_remedy}</Text>
                    </View>
                  ) : (
                    <View>
                      <View style={styles.remedyHeader}>
                        <MaterialIcons name="healing" size={14} color={COLORS.textGold} />
                        <Text style={styles.resultDescTitle}>
                          {isTamil ? 'பரிந்துரை / தீர்வு:' : 'Recommendation / Remedy:'}
                        </Text>
                      </View>
                      <Text style={styles.resultDesc}>{scanResult.description}</Text>
                    </View>
                  )}

                  {/* Action chips */}
                  {scanResult.severity !== 'Healthy' && (
                    <View style={styles.chipRow}>
                      <View style={styles.chip}>
                        <MaterialIcons name="eco" size={12} color={COLORS.textGold} />
                        <Text style={styles.chipText}>{isTamil ? 'இயற்கை முறை' : 'Organic Treatment'}</Text>
                      </View>
                      <View style={styles.chip}>
                        <MaterialIcons name="science" size={12} color={COLORS.textGold} />
                        <Text style={styles.chipText}>{isTamil ? 'வேளாண் நிபுணர்' : 'Consult Expert'}</Text>
                      </View>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.outlineBtn} onPress={openCamera} activeOpacity={0.8}>
                  <MaterialIcons name="photo-camera" size={20} color={COLORS.gold} />
                  <Text style={styles.outlineBtnText}>{isTamil ? 'கேமரா' : 'Camera'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.outlineBtn} onPress={pickImage} activeOpacity={0.8}>
                  <MaterialIcons name="image" size={20} color={COLORS.gold} />
                  <Text style={styles.outlineBtnText}>{isTamil ? 'பதிவேற்று' : 'Upload'}</Text>
                </TouchableOpacity>
              </View>

              {isAuthenticated && (
                <TouchableOpacity 
                  style={styles.historyToggleBtn} 
                  onPress={() => {
                    setShowHistory(!showHistory);
                    if (!showHistory) loadHistory();
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="history" size={18} color={COLORS.textSecondary} />
                  <Text style={styles.historyToggleText}>
                    {showHistory 
                      ? (isTamil ? 'வரலாற்றை மறைக்கவும்' : 'Hide History')
                      : (isTamil ? 'கடந்த கால சோதனைகள்' : 'View Scan History')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Scan History Drawer/Section */}
            {showHistory && isAuthenticated && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>{isTamil ? 'கடந்த கால பரிசோதனைகள்' : 'Scan History'}</Text>
                {loadingHistory ? (
                  <FloatingLeafLoader color={COLORS.gold} size={22} style={{ marginVertical: 10 }} />
                ) : scanHistory.length === 0 ? (
                  <Text style={styles.emptyText}>{isTamil ? 'பதிவுகள் எதுவும் இல்லை' : 'No scans found yet.'}</Text>
                ) : (
                  scanHistory.map((item) => (
                    <View key={item.id} style={styles.historyItem}>
                      <Image source={{ uri: item.image_url }} style={styles.historyThumb} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.historyStatus} numberOfLines={1}>{item.status}</Text>
                        <Text style={styles.historyDate}>
                          {new Date(item.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.historyAction}
                        onPress={() => {
                          setImageUri(item.image_url);
                          try {
                            const parsed = JSON.parse(item.description);
                            setScanResult({
                              status: parsed.status || item.status,
                              description: parsed.description || item.description,
                              confidence: typeof parsed.confidence === 'number' ? (parsed.confidence <= 1 ? Math.round(parsed.confidence * 100) : parsed.confidence) : 0,
                              severity: parsed.severity || 'Healthy',
                              disease_name: parsed.disease_name || item.status,
                              organic_remedy: parsed.organic_remedy,
                              chemical_remedy: parsed.chemical_remedy,
                            });
                          } catch(e) {
                            setScanResult({ status: item.status, description: item.description, confidence: 0, severity: 'Healthy' });
                          }
                        }}
                        activeOpacity={0.8}
                      >
                        <MaterialIcons name="visibility" size={18} color={COLORS.gold} />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* Fertilizer Recommendation Calculator */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{isTamil ? 'உர மேலாண்மை கால்குலேட்டர்' : 'Fertilizer Calculator'}</Text>
              
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>
                  {isOrganic ? (isTamil ? 'இயற்கை உரம் (Organic)' : 'Organic Mode') : (isTamil ? 'இரசாயன உரம் (Chemical)' : 'Chemical Mode')}
                </Text>
                <Switch
                  value={isOrganic}
                  onValueChange={setIsOrganic}
                  trackColor={{ false: COLORS.darkBg, true: COLORS.goldBorder }}
                  thumbColor={isOrganic ? COLORS.gold : '#888'}
                />
              </View>

              {isOrganic && (
                <View style={styles.infoBadge}>
                  <Text style={styles.infoBadgeText}>
                    💡 {isTamil
                      ? 'இயற்கை உர அளவு, இரசாயன உரத்தின் NPK மண் ஊட்டச்சத்து மதிப்புக்கு சமமாக கணக்கிடப்பட்டுள்ளது.'
                      : 'Organic dosage calculated to match effective NPK soil nutrient yield of chemical recommendations.'}
                  </Text>
                </View>
              )}

              <Text style={styles.label}>{isTamil ? 'பயிர் வகை' : 'Crop Type'}</Text>

              <TouchableOpacity 
                style={styles.pickerTrigger} 
                onPress={() => setCropModalVisible(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.pickerTriggerText}>{selectedCrop}</Text>
                <MaterialIcons name="arrow-drop-down" size={24} color={COLORS.gold} />
              </TouchableOpacity>

              <Text style={styles.label}>{isTamil ? 'நிலப்பரப்பு (ஏக்கர்)' : 'Area (in Acres)'}</Text>
              <TextInput
                style={[
                  styles.input,
                  activeInput === 'acres' && styles.inputFocused
                ]}
                value={acres}
                onChangeText={setAcres}
                placeholder="e.g. 1.5"
                placeholderTextColor="rgba(236,253,245,0.4)"
                keyboardType="numeric"
                onFocus={() => setActiveInput('acres')}
                onBlur={() => setActiveInput(null)}
              />

              {isCalculating ? (
                <FloatingLeafLoader color={COLORS.gold} size={28} style={{ marginVertical: 10 }} />
              ) : (
                <TouchableOpacity onPress={() => calculateFertilizer()} activeOpacity={0.85}>
                  <LinearGradient
                    colors={GRADIENTS.gold}
                    style={styles.calcBtn}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <MaterialIcons name="calculate" size={20} color={COLORS.textDark} />
                    <Text style={styles.calcBtnText}>
                      {isTamil ? 'உர அளவை கணக்கிடு' : 'Calculate Fertilizer Dosage'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {calcResult && (
                <View style={styles.calcResultContainer}>
                  <View style={styles.calcResultHeader}>
                    <MaterialIcons name="eco" size={18} color={COLORS.gold} />
                    <Text style={styles.calcResultTitle}>{isTamil ? 'பரிந்துரைக்கப்பட்ட அளவு:' : 'Recommended Dosage:'}</Text>
                  </View>
                  <Text style={styles.calcResultText}>{calcResult}</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      {/* Crop Selector Modal */}
      <Modal visible={cropModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isTamil ? 'பயிரை தேர்ந்தெடுக்கவும்' : 'Select Crop'}</Text>
              <TouchableOpacity onPress={() => setCropModalVisible(false)} style={styles.closeBtn}>
                <MaterialIcons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalSearch}
              placeholder={isTamil ? "தேடுக..." : "Search crop..."}
              placeholderTextColor="rgba(236,253,245,0.4)"
              value={cropSearch}
              onChangeText={setCropSearch}
            />

            <FlatList
              data={filteredCrops}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.cropOption} 
                  onPress={() => {
                    setSelectedCrop(item);
                    setCropModalVisible(false);
                    setCropSearch('');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cropOptionText}>{item}</Text>
                  {selectedCrop === item && <MaterialIcons name="check" size={18} color={COLORS.gold} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, padding: SPACING.md },
  container: { flex: 1 },
  card: {
    backgroundColor: COLORS.glassCard,
    borderColor: COLORS.glassBorder,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  
  previewContainer: {
    width: '100%',
    height: 220,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.goldBorderSoft,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  analysingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,26,14,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analysingText: {
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  leafIcon: {
    fontSize: 44,
    marginBottom: SPACING.xs,
  },
  progressTrack: {
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(212,175,55,0.2)',
    borderRadius: 2,
    marginTop: SPACING.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  severityBadge: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  badgeHealthy: { backgroundColor: 'rgba(34,197,94,0.18)', borderWidth: 1, borderColor: '#22c55e' },
  badgeMild: { backgroundColor: 'rgba(234,179,8,0.18)', borderWidth: 1, borderColor: '#eab308' },
  badgeModerate: { backgroundColor: 'rgba(245,158,11,0.18)', borderWidth: 1, borderColor: '#f59e0b' },
  badgeSevere: { backgroundColor: 'rgba(239,68,68,0.18)', borderWidth: 1, borderColor: '#ef4444' },
  severityBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  confidenceLabel: {
    fontSize: 12,
    color: COLORS.textGold,
    fontWeight: '600',
  },
  confidenceValue: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  confidenceTrack: {
    height: 5,
    backgroundColor: 'rgba(212,175,55,0.12)',
    borderRadius: 3,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 3,
  },
  remedyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  chipRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212,175,55,0.1)',
    borderColor: 'rgba(212,175,55,0.3)',
    borderWidth: 1,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: {
    fontSize: 11,
    color: COLORS.textGold,
    fontWeight: '600',
  },
  infoBadge: {
    backgroundColor: 'rgba(212,175,55,0.08)',
    borderColor: 'rgba(212,175,55,0.25)',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoBadgeText: {
    fontSize: 12,
    color: COLORS.textGold,
    lineHeight: 18,
    flex: 1,
  },

  resultContainer: {
    backgroundColor: 'rgba(3,53,33,0.5)',
    borderColor: 'rgba(212,175,55,0.15)',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  resultStatusTitle: { fontSize: 12, fontWeight: 'bold', color: COLORS.textGold, letterSpacing: 0.5 },
  resultStatus: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginTop: 2, marginBottom: SPACING.sm },
  resultDivider: { height: 1, backgroundColor: 'rgba(212,175,55,0.1)', marginVertical: SPACING.xs },
  resultDescTitle: { fontSize: 12, fontWeight: 'bold', color: COLORS.textGold, letterSpacing: 0.5 },
  resultDesc: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4, lineHeight: 20 },
  
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  outlineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.08)',
    borderColor: COLORS.goldBorder,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    gap: SPACING.xs,
  },
  outlineBtnText: {
    color: COLORS.textGold,
    fontWeight: 'bold',
    fontSize: 14,
  },
  
  historyToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    gap: SPACING.xs,
    paddingVertical: 8,
  },
  historyToggleText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: SPACING.md },
  emptyText: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', marginVertical: SPACING.md },
  
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(3,53,33,0.3)',
    borderColor: 'rgba(212,175,55,0.08)',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  historyThumb: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
  },
  historyStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  historyDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  historyAction: {
    backgroundColor: 'rgba(212,175,55,0.1)',
    padding: 8,
    borderRadius: RADIUS.sm,
  },
  
  // Calculator styles
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(3,53,33,0.3)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.08)',
    marginBottom: SPACING.md,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textGold,
  },
  label: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 6, marginLeft: 2 },
  pickerTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    marginBottom: SPACING.md,
  },
  pickerTriggerText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  inputFocused: {
    borderColor: COLORS.inputFocusBorder,
  },
  calcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    marginTop: SPACING.xs,
    ...SHADOWS.button,
  },
  calcBtnText: {
    color: COLORS.textDark,
    fontWeight: 'bold',
    fontSize: 15,
  },
  
  calcResultContainer: {
    backgroundColor: 'rgba(4,106,56,0.2)',
    borderColor: COLORS.goldBorderSoft,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
  },
  calcResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 6,
  },
  calcResultTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textGold,
  },
  calcResultText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2,26,14,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.goldBorderSoft,
    borderWidth: 1,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    maxHeight: '75%',
  },
  modalHandle: {
    width: 48,
    height: 5,
    backgroundColor: 'rgba(212,175,55,0.3)',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  closeBtn: {
    backgroundColor: COLORS.cardBg2,
    padding: 6,
    borderRadius: RADIUS.pill,
  },
  modalSearch: {
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  cropOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,175,55,0.1)',
  },
  cropOptionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
});

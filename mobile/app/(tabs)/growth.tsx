import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, ImageBackground, Alert, Image, ActivityIndicator, TextInput, FlatList, Modal } from 'react-native';
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
};

export default function GrowthScreen() {
  const { isTamil } = useApp();
  const { isAuthenticated } = useAuth();
  const [isOrganic, setIsOrganic] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<{ status: string; description: string } | null>(null);

  const [acres, setAcres] = useState('1');
  const [selectedCrop, setSelectedCrop] = useState('Paddy');
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [cropSearch, setCropSearch] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcResult, setCalcResult] = useState<string | null>(null);
  const [activeInput, setActiveInput] = useState<string | null>(null);

  const filteredCrops = uniqueCrops.filter((c: any) => c.toLowerCase().includes(cropSearch.toLowerCase()));

  // Scan history removed as per user request to not store images

  // ── Process image ──
  const handleAnalyze = async () => {
    if (!imageBase64) return;
    setScanResult(null);
    setIsAnalyzing(true);

    try {
      // Always use non-authenticated snap-solve so we don't save to DB
      const res = await fetchWithTimeout(`${API_BASE_URL}/ml/snap-solve`, {
        method: 'POST',
        body: JSON.stringify({ image_base64: imageBase64, is_tamil: isTamil }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Server error');
      }

      const data = await res.json();
      const reply = data.reply || data;
      setScanResult({ status: reply.status, description: reply.description });
    } catch (err: any) {
      console.error(err);
      Alert.alert(isTamil ? 'பிழை' : 'Error', err.message || (isTamil ? 'மன்னிக்கவும், பிழை ஏற்பட்டது.' : 'Error analyzing image.'));
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
            ? `**இயற்கை உரப் பரிந்துரை (${selectedCrop}):**\n• ஜீவாமிர்தம்: ${(area * 200).toFixed(1)} லிட்டர்\n• பஞ்சகவ்யா: ${(area * 10).toFixed(1)} லிட்டர்\n• வேப்பம் புண்ணாக்கு: ${(area * 100).toFixed(1)} கிலோ\n• மண்புழு உரம்: ${(area * 150).toFixed(1)} கிலோ`
            : `**Organic Fertilizer Recommendation (${selectedCrop}):**\n• Jeevamrutham: ${(area * 200).toFixed(1)} L\n• Panchagavya: ${(area * 10).toFixed(1)} L\n• Neem Cake: ${(area * 100).toFixed(1)} kg\n• Vermicompost: ${(area * 150).toFixed(1)} kg`
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
      allowsEditing: true,
      quality: 0.4,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64);
      setScanResult(null);
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
      allowsEditing: true,
      quality: 0.4,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64);
      setScanResult(null);
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
                <>
                  <View style={styles.previewContainer}>
                    <Image source={{ uri: imageUri }} style={styles.previewImage} />
                    {isAnalyzing && (
                      <View style={styles.analysingOverlay}>
                        <ActivityIndicator size="large" color={COLORS.gold} />
                        <Text style={styles.analysingText}>{isTamil ? 'பகுப்பாய்வு செய்கிறது...' : 'Analyzing...'}</Text>
                      </View>
                    )}
                  </View>
                  {!isAnalyzing && !scanResult && (
                    <TouchableOpacity style={{ borderRadius: RADIUS.md, overflow: 'hidden', marginBottom: 15 }} onPress={handleAnalyze}>
                      <LinearGradient colors={GRADIENTS.gold} style={styles.calcBtn}>
                        <MaterialIcons name="search" size={20} color={COLORS.textDark} />
                        <Text style={styles.calcBtnText}>{isTamil ? 'பகுப்பாய்வு செய்' : 'Analyze Image'}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </>
              )}

              {scanResult && (
                <View style={styles.resultContainer}>
                  <Text style={styles.resultStatusTitle}>{isTamil ? 'நிலைமை / கண்டறிதல்:' : 'Status / Detection:'}</Text>
                  <Text style={styles.resultStatus}>{scanResult.status}</Text>
                  <View style={styles.resultDivider} />
                  <Text style={styles.resultDescTitle}>{isTamil ? 'பரிந்துரை / தீர்வு:' : 'Recommendation / Remedy:'}</Text>
                  <Text style={styles.resultDesc}>{scanResult.description}</Text>
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
            </View>

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
                <ActivityIndicator color={COLORS.gold} size="large" style={{ marginVertical: 10 }} />
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

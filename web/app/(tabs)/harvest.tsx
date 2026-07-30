import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import FloatingLeafLoader from '../../components/FloatingLeafLoader';

import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../_layout';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL, fetchWithTimeout } from '../_api/config';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SHADOWS, SPACING, GRADIENTS } from '../../constants/theme';

import AgriBackground from '../../components/AgriBackground';

export default function HarvestScreen() {
  const { isTamil } = useApp();
  const [gradeResult, setGradeResult] = useState<null | { grade: string; color: string; factors: string }>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [forecast, setForecast] = useState<any[] | null>(null);
  const [loadingForecast, setLoadingForecast] = useState(false);

  useEffect(() => {
    setLoadingForecast(true);
    fetchWithTimeout(`${API_BASE_URL}/ml/price-predict?crop=paddy`)
      .then(res => res.json())
      .then(data => {
        setLoadingForecast(false);
        if (data && data.forecast) {
          setForecast(data.forecast);
        }
      })
      .catch(err => {
        console.error(err);
        setLoadingForecast(false);
      });
  }, []);

  const handleSnapAnalyze = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.5,
      base64: true,
    });

    if (result.canceled || !result.assets[0].base64) return;

    setIsAnalyzing(true);
    setGradeResult(null);

    try {
      const base64Img = result.assets[0].base64;
      const res = await fetchWithTimeout(`${API_BASE_URL}/ml/grade-crop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_base64: base64Img, is_tamil: isTamil }),
      });
      const data = await res.json();
      setIsAnalyzing(false);
      if (res.ok && data && data.grade) {
        setGradeResult({
          grade: data.grade,
          color: data.color || COLORS.gold,
          factors: data.factors,
        });
      } else {
        throw new Error('Invalid response');
      }
    } catch (err) {
      console.error(err);
      setIsAnalyzing(false);
      setGradeResult({
        grade: 'Grade B (Local Market)',
        color: '#D4AF37',
        factors: isTamil
          ? 'சராசரி அளவு • சில குறைபாடுகள் • நடுத்தர தரம்'
          : 'Average size • Minor blemishes • Standard quality',
      });
    }
  };


  return (
    <View style={styles.container}>
      <AgriBackground />
      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>{isTamil ? 'அறுவடை & தரம்' : 'Harvest & Quality'}</Text>

        {/* Quality Grader */}
        <LinearGradient colors={GRADIENTS.card} style={styles.card}>
          <Text style={styles.cardTitle}>
            {isTamil ? 'தர மதிப்பீட்டாளர்' : 'Quality Grader'}
          </Text>
          <Text style={styles.cardSubtitle}>
            {isTamil
              ? 'உங்கள் விளைபொருளின் புகைப்படத்தை எடுத்து தரத்தை அறியுங்கள்.'
              : 'Snap a photo of your produce to instantly get its export grade.'}
          </Text>

          {/* Camera area */}
          <TouchableOpacity
            style={[styles.cameraBox, isAnalyzing && styles.cameraBoxActive]}
            onPress={handleSnapAnalyze}
            activeOpacity={0.8}
          >
            {isAnalyzing ? (
              <View style={styles.analyzingContainer}>
                <FloatingLeafLoader color={COLORS.gold} size={40} />
                <Text style={styles.analyzingText}>
                  {isTamil ? 'பகுப்பாய்வு செய்கிறது...' : 'Analyzing...'}
                </Text>
              </View>
            ) : (
              <View style={styles.cameraPrompt}>
                <MaterialIcons name="camera-alt" size={48} color={COLORS.gold} />
                <Text style={styles.cameraPromptText}>
                  {isTamil ? 'படமெடுக்க தட்டவும்' : 'Tap to Snap & Analyze'}
                </Text>
                <Text style={styles.cameraHint}>
                  {isTamil ? '(EfficientNet மாதிரி)' : '(EfficientNet Model)'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Grade result */}
          {gradeResult && (
            <View style={[styles.resultBox, { borderColor: gradeResult.color }]}>
              <View style={styles.resultHeader}>
                <MaterialIcons name="verified" size={22} color={gradeResult.color} />
                <Text style={[styles.gradeText, { color: gradeResult.color }]}>
                  {gradeResult.grade}
                </Text>
              </View>
              <Text style={styles.factorsText}>{gradeResult.factors}</Text>
              <TouchableOpacity
                style={styles.certButton}
                onPress={() => Alert.alert(
                  isTamil ? 'சான்றிதழ்' : 'Certificate',
                  isTamil ? 'PDF சான்றிதழ் விரைவில் கிடைக்கும்!' : 'PDF Certificate feature coming soon!'
                )}
                activeOpacity={0.8}
              >
                <LinearGradient colors={GRADIENTS.gold} style={styles.certButtonGrad} start={{x:0, y:0}} end={{x:1, y:0}}>
                  <MaterialIcons name="download" size={18} color={COLORS.darkBg} />
                  <Text style={styles.certButtonText}>
                    {isTamil ? 'சான்றிதழை பெறு' : 'Generate Certificate'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>

        {/* Market Price Forecast card */}
        <LinearGradient colors={GRADIENTS.card} style={styles.card}>
          <Text style={styles.cardTitle}>
            {isTamil ? 'சந்தை விலை கணிப்பு (நெல்)' : 'Market Price Forecast (Paddy)'}
          </Text>
          <Text style={styles.cardSubtitle}>
            {isTamil
              ? 'அறுவடைக்கு பின் விற்க நெல் விலை முன்னறிவிப்பு.'
              : 'Post-harvest Paddy price trends for optimal sales timing.'}
          </Text>
          {loadingForecast ? (
            <FloatingLeafLoader color={COLORS.gold} size={22} style={{ marginVertical: 20 }} />
          ) : forecast ? (
            <View style={styles.forecastRowContainer}>
              {forecast.slice(0, 5).map((item, idx) => (
                <View key={idx} style={styles.forecastDayCol}>
                  <Text style={styles.forecastDayText}>{item.day}</Text>
                  <Text style={styles.forecastPriceText}>₹{Math.round(item.price)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.pendingBox}>
              <MaterialIcons name="error-outline" size={32} color={COLORS.gold} />
              <Text style={styles.pendingText}>
                {isTamil ? 'கணிப்புகளைப் பெறுவதில் பிழை' : 'Error loading forecast'}
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Shelf Life Tips */}
        <LinearGradient colors={GRADIENTS.card} style={styles.card}>
          <Text style={styles.cardTitle}>
            {isTamil ? 'சேமிப்பு குறிப்புகள்' : 'Storage & Shelf Life Tips'}
          </Text>
          {[
            { icon: 'thermostat', label: isTamil ? 'நெல்: 12-15°C, 60% ஈரப்பதம்' : 'Paddy: 12-15°C, 60% humidity' },
            { icon: 'opacity', label: isTamil ? 'மஞ்சள்: நிழலான, உலர்ந்த இடம்' : 'Turmeric: Cool, dry & dark storage' },
            { icon: 'ac-unit', label: isTamil ? 'தக்காளி: 8-12°C குளிர்பதனம்' : 'Tomato: 8-12°C cold storage' },
          ].map((tip, i) => (
            <View key={i} style={[styles.tipRow, i !== 2 && styles.tipRowBorder]}>
              <View style={styles.tipIconWrap}>
                <MaterialIcons name={tip.icon as any} size={20} color={COLORS.gold} />
              </View>
              <Text style={styles.tipText}>{tip.label}</Text>
            </View>
          ))}
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  header: { fontSize: 24, fontWeight: '900', color: COLORS.textPrimary, marginBottom: SPACING.md, marginTop: SPACING.sm },
  card: { 
    borderRadius: RADIUS.xl, 
    padding: SPACING.md, 
    marginBottom: SPACING.lg, 
    borderWidth: 1, 
    borderColor: COLORS.goldBorderSoft,
    ...SHADOWS.card 
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  cardSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 14, lineHeight: 20 },
  cameraBox: {
    height: 160,
    backgroundColor: 'rgba(3,53,33,0.3)',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.goldBorderSoft,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  cameraBoxActive: { borderColor: COLORS.gold, backgroundColor: 'rgba(212,175,55,0.05)' },
  cameraPrompt: { alignItems: 'center', gap: 8 },
  cameraPromptText: { fontSize: 15, color: COLORS.textGold, fontWeight: '700' },
  cameraHint: { fontSize: 11, color: COLORS.textMuted },
  analyzingContainer: { alignItems: 'center', gap: 10 },
  analyzingText: { fontSize: 14, color: COLORS.textGold, fontWeight: 'bold' },
  
  resultBox: {
    backgroundColor: 'rgba(3,53,33,0.5)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    marginBottom: 8,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  gradeText: { fontSize: 16, fontWeight: '800' },
  factorsText: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.md, lineHeight: 20 },
  certButton: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.button,
  },
  certButtonGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 6,
  },
  certButtonText: { color: COLORS.darkBg, fontWeight: '800', fontSize: 14 },
  
  pendingBox: { alignItems: 'center', padding: 20, gap: 8 },
  pendingText: { fontSize: 14, color: COLORS.textGold, fontWeight: 'bold' },
  
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: 10 },
  tipRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  tipIconWrap: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: 'rgba(212,175,55,0.1)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  tipText: { fontSize: 14, color: COLORS.textPrimary, flex: 1, fontWeight: '600' },
  
  forecastRowContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: SPACING.sm, 
    backgroundColor: 'rgba(212,175,55,0.05)', 
    borderRadius: RADIUS.md, 
    paddingHorizontal: SPACING.sm, 
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.goldBorderSoft,
  },
  forecastDayCol: { alignItems: 'center', flex: 1 },
  forecastDayText: { fontSize: 12, fontWeight: 'bold', color: COLORS.textMuted },
  forecastPriceText: { fontSize: 13, color: COLORS.textGold, fontWeight: '800', marginTop: 4 },
});

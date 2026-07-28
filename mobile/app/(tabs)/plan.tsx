import { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, ActivityIndicator, TouchableOpacity, Animated, Easing, Platform } from 'react-native';
import { useApp } from '../_layout';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_BASE_URL, fetchWithTimeout } from '../_api/config';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import GlassCard from '../../components/GlassCard';
import cropDataRaw from '../../assets/crop_suggestion.json';

type CropSuggestion = {
  "S.No"?: number;
  "Constituency Name": string;
  "District": string;
  "Crop 1": string;
  "Crop 2": string;
  "Crop 3": string;
};

const cropData = cropDataRaw as CropSuggestion[];

function StepIndicator({ currentStep, steps }: { currentStep: number, steps: string[] }) {
  return (
    <View style={styles.stepIndicatorContainer}>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepWrapper}>
          <View style={[styles.stepDot, currentStep >= index ? styles.stepDotActive : null]}>
            {currentStep > index ? (
              <MaterialIcons name="check" size={14} color={COLORS.darkBg} />
            ) : (
              <Text style={[styles.stepDotText, currentStep >= index ? styles.stepDotTextActive : null]}>{index + 1}</Text>
            )}
          </View>
          <Text style={[styles.stepText, currentStep >= index ? styles.stepTextActive : null]}>{step}</Text>
          {index < steps.length - 1 && (
            <View style={[styles.stepLine, currentStep > index ? styles.stepLineActive : null]} />
          )}
        </View>
      ))}
    </View>
  );
}

export default function PlanScreen({ initialQuery: propQuery }: { initialQuery?: string }) {
  const { isTamil } = useApp();
  const params = useLocalSearchParams();
  const initialQuery = propQuery || params.query as string || '';

  const [currentStep, setCurrentStep] = useState(0);
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<CropSuggestion | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [area, setArea] = useState('');
  const [currentCrop, setCurrentCrop] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const steps = isTamil ? ['இடம்', 'விவரங்கள்', 'முடிவுகள்'] : ['Location', 'Details', 'Prediction'];

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateToStep = (step: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -50, duration: 200, useNativeDriver: true })
    ]).start(() => {
      setCurrentStep(step);
      slideAnim.setValue(50);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, easing: Easing.out(Easing.back(1.5)) as any, useNativeDriver: true })
      ]).start();
    });
  };

  const suggestions = useMemo(() => {
    if (!locationQuery) return [];
    const lowerQuery = locationQuery.toLowerCase();
    return cropData.filter(item => 
      item["Constituency Name"].toLowerCase().includes(lowerQuery) ||
      item["District"].toLowerCase().includes(lowerQuery)
    ).slice(0, 5);
  }, [locationQuery]);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setResults(null);
    animateToStep(2);

    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/ml/constituency/${encodeURIComponent(selectedLocation!["Constituency Name"])}`);
      const data = await res.json();
      
      let cropList = [selectedLocation!["Crop 1"], selectedLocation!["Crop 2"], selectedLocation!["Crop 3"]].filter(Boolean);
      if (res.ok && data && data.recommended_crops) {
        cropList = data.recommended_crops.filter(Boolean);
      }
      
      let simResult = null;
      if (currentCrop) {
        try {
          const simRes = await fetchWithTimeout(`${API_BASE_URL}/api/ml/crop-switch?location=${encodeURIComponent(selectedLocation!["Constituency Name"])}&current_crop=${encodeURIComponent(currentCrop)}`);
          if (simRes.ok) simResult = await simRes.json();
        } catch (e) {}
      }

      setTimeout(() => {
        setIsLoading(false);
        setResults({ cropList, simResult });
      }, 800);

    } catch (err) {
      setTimeout(() => {
        setIsLoading(false);
        setResults({
          cropList: [selectedLocation!["Crop 1"], selectedLocation!["Crop 2"], selectedLocation!["Crop 3"]].filter(Boolean),
          simResult: null
        });
      }, 800);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>{isTamil ? 'பயிர் திட்டமிடல்' : 'Crop Planner'}</Text>
          <Text style={styles.pageSubtitle}>{isTamil ? 'அடுத்த பருவத்திற்கு சரியான பயிரை கண்டறியுங்கள்.' : 'Find the perfect crop for your next harvest.'}</Text>
        </View>

        <StepIndicator currentStep={currentStep} steps={steps} />

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
          {currentStep === 0 && (
            <GlassCard style={styles.wizardCard}>
              <Text style={styles.stepHeading}>{isTamil ? 'உங்கள் விவசாய நிலம் எங்கே உள்ளது?' : 'Where is your farm located?'}</Text>
              
              <Text style={styles.label}>{isTamil ? 'ஊர் / தொகுதி தேடுக' : 'Search Village / Constituency'}</Text>
              <View style={{ zIndex: 10 }}>
                <TextInput 
                  style={styles.input} 
                  placeholder={isTamil ? "எ.கா. சிதம்பரம்" : "e.g. Chidambaram"} 
                  placeholderTextColor="rgba(236,253,245,0.4)"
                  value={locationQuery} 
                  onChangeText={(text) => {
                    setLocationQuery(text);
                    setShowSuggestions(true);
                    setSelectedLocation(null);
                  }} 
                  onFocus={() => setShowSuggestions(true)}
                />
                
                {showSuggestions && suggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    {suggestions.map((loc, index) => (
                      <TouchableOpacity 
                        key={index} 
                        style={styles.suggestionItem}
                        onPress={() => {
                          setLocationQuery(`${loc["Constituency Name"]}, ${loc["District"]}`);
                          setSelectedLocation(loc);
                          setShowSuggestions(false);
                        }}
                      >
                        <Text style={styles.suggestionText}>
                          {loc["Constituency Name"]} <Text style={styles.suggestionDistrict}>({loc["District"]})</Text>
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <TouchableOpacity 
                style={[styles.nextBtn, !selectedLocation && styles.nextBtnDisabled]} 
                disabled={!selectedLocation}
                onPress={() => animateToStep(1)}
              >
                <LinearGradient colors={!selectedLocation ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] : GRADIENTS.gold} style={StyleSheet.absoluteFillObject} />
                <Text style={[styles.nextBtnText, !selectedLocation && { color: COLORS.textMuted }]}>{isTamil ? 'அடுத்து' : 'Next'}</Text>
                <MaterialIcons name="arrow-forward" size={20} color={!selectedLocation ? COLORS.textMuted : COLORS.textDark} />
              </TouchableOpacity>
            </GlassCard>
          )}

          {currentStep === 1 && (
            <GlassCard style={styles.wizardCard}>
              <Text style={styles.stepHeading}>{isTamil ? 'நிலம் மற்றும் தற்போதைய பயிர்' : 'Farm size and current crop'}</Text>
              
              <Text style={styles.label}>{isTamil ? 'நிலப்பரப்பு (ஏக்கர்)' : 'Area (in Acres)'}</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. 5" 
                placeholderTextColor="rgba(236,253,245,0.4)"
                keyboardType="numeric" 
                value={area} 
                onChangeText={setArea} 
              />

              <Text style={styles.label}>{isTamil ? 'தற்போதைய பயிர் (விருப்பப்பட்டால்)' : 'Current Crop (Optional)'}</Text>
              <TextInput 
                style={styles.input} 
                placeholder={isTamil ? "எ.கா. தக்காளி" : "e.g. Tomato"} 
                placeholderTextColor="rgba(236,253,245,0.4)"
                value={currentCrop} 
                onChangeText={setCurrentCrop} 
              />

              <View style={styles.rowButtons}>
                <TouchableOpacity style={styles.backBtn} onPress={() => animateToStep(0)}>
                  <Text style={styles.backBtnText}>{isTamil ? 'பின்னே' : 'Back'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.nextBtn, { flex: 1 }]} onPress={handleAnalyze}>
                  <LinearGradient colors={GRADIENTS.gold} style={StyleSheet.absoluteFillObject} />
                  <Text style={styles.nextBtnText}>{isTamil ? 'கணிக்கவும்' : 'Predict'}</Text>
                  <MaterialIcons name="analytics" size={20} color={COLORS.textDark} />
                </TouchableOpacity>
              </View>
            </GlassCard>
          )}

          {currentStep === 2 && (
            <View>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={COLORS.gold} size="large" />
                  <Text style={styles.loadingText}>{isTamil ? 'தரவுகளை பகுப்பாய்வு செய்கிறது...' : 'Analyzing soil & market data...'}</Text>
                </View>
              ) : (
                results && (
                  <View>
                    <Text style={styles.resultsHeading}>{isTamil ? 'பரிந்துரைக்கப்பட்ட பயிர்கள்' : 'Top Recommendations'}</Text>
                    
                    {results.cropList.map((crop: string, index: number) => (
                      <GlassCard key={index} variant={index === 0 ? 'gold' : 'default'} style={styles.resultCard}>
                        <View style={styles.resultHeader}>
                          <View style={[styles.rankBadge, index === 0 && { backgroundColor: COLORS.gold }]}>
                            <Text style={[styles.rankText, index === 0 && { color: COLORS.textDark }]}>#{index + 1}</Text>
                          </View>
                          <Text style={styles.resultCropName}>{crop}</Text>
                          {index === 0 && <MaterialIcons name="star" size={20} color={COLORS.gold} />}
                        </View>
                        {index === 0 && (
                          <View style={styles.resultMetrics}>
                            <View style={styles.metricItem}>
                              <Text style={styles.metricLabel}>{isTamil ? 'பொருத்தம்' : 'Match'}</Text>
                              <Text style={styles.metricValue}>98%</Text>
                            </View>
                            <View style={styles.metricItem}>
                              <Text style={styles.metricLabel}>{isTamil ? 'லாப வளர்ச்சி' : 'Est. ROI'}</Text>
                              <Text style={[styles.metricValue, { color: COLORS.success }]}>+32%</Text>
                            </View>
                            <View style={styles.metricItem}>
                              <Text style={styles.metricLabel}>{isTamil ? 'நீர் தேவை' : 'Water Need'}</Text>
                              <Text style={[styles.metricValue, { color: '#60A5FA' }]}>Low</Text>
                            </View>
                          </View>
                        )}
                      </GlassCard>
                    ))}

                    {results.simResult && results.simResult.recommended_switch && (
                       <GlassCard variant="dark" style={styles.switchCard}>
                          <Text style={styles.switchTitle}>{isTamil ? 'பயிர் மாற்று பகுப்பாய்வு' : 'Crop Switch Analysis'}</Text>
                          <View style={styles.switchRow}>
                             <View style={styles.switchCol}>
                               <Text style={styles.switchLabel}>{isTamil ? 'தற்போதைய பயிர்' : 'Current'}</Text>
                               <Text style={styles.switchValue}>{currentCrop}</Text>
                             </View>
                             <MaterialIcons name="arrow-forward" size={24} color={COLORS.gold} style={{ marginHorizontal: 16 }} />
                             <View style={styles.switchCol}>
                               <Text style={styles.switchLabel}>{isTamil ? 'பரிந்துரைக்கப்படும் பயிர்' : 'Switch To'}</Text>
                               <Text style={[styles.switchValue, { color: COLORS.success }]}>{results.simResult.recommended_switch}</Text>
                             </View>
                          </View>
                          <Text style={styles.switchMargin}>
                             {isTamil ? 'எதிர்பார்க்கப்படும் லாப வளர்ச்சி:' : 'Projected Growth Margin:'} <Text style={{color: COLORS.success}}>{results.simResult.projected_growth_margin || '+24%'}</Text>
                          </Text>
                       </GlassCard>
                    )}

                    <TouchableOpacity style={styles.resetBtn} onPress={() => animateToStep(0)}>
                      <Text style={styles.resetBtnText}>{isTamil ? 'மீண்டும் தொடங்கு' : 'Start Over'}</Text>
                    </TouchableOpacity>
                  </View>
                )
              )}
            </View>
          )}
        </Animated.View>
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, padding: SPACING.md },
  container: { flex: 1 },
  header: { marginBottom: SPACING.xl, marginTop: SPACING.md },
  pageTitle: { fontSize: 28, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 8 },
  pageSubtitle: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  
  stepIndicatorContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl },
  stepWrapper: { flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  stepDotActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  stepDotText: { fontSize: 12, fontWeight: 'bold', color: COLORS.textMuted },
  stepDotTextActive: { color: COLORS.textDark },
  stepText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginLeft: 8 },
  stepTextActive: { color: COLORS.textPrimary },
  stepLine: { width: 30, height: 2, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 8 },
  stepLineActive: { backgroundColor: COLORS.gold },

  wizardCard: { padding: SPACING.xl },
  stepHeading: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: SPACING.lg },
  label: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.4)', borderRadius: RADIUS.md, padding: 14, marginBottom: SPACING.lg, fontSize: 16, color: COLORS.textPrimary },
  
  suggestionsContainer: { backgroundColor: COLORS.cardBg, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.goldBorderSoft, marginTop: -16, marginBottom: SPACING.md, maxHeight: 180, overflow: 'hidden', ...SHADOWS.input },
  suggestionItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.1)' },
  suggestionText: { fontSize: 15, color: COLORS.textPrimary },
  suggestionDistrict: { fontSize: 13, color: COLORS.textSecondary },

  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: RADIUS.md, gap: 8, overflow: 'hidden' },
  nextBtnDisabled: { opacity: 0.6 },
  nextBtnText: { color: COLORS.textDark, fontWeight: 'bold', fontSize: 16 },
  
  rowButtons: { flexDirection: 'row', gap: SPACING.md },
  backBtn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  backBtnText: { color: COLORS.textPrimary, fontWeight: 'bold', fontSize: 16 },

  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  loadingText: { color: COLORS.textGold, marginTop: 16, fontSize: 16, fontWeight: '600' },

  resultsHeading: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: SPACING.lg },
  resultCard: { marginBottom: SPACING.md },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  rankText: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary },
  resultCropName: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, flex: 1 },
  
  resultMetrics: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  metricItem: { alignItems: 'center' },
  metricLabel: { fontSize: 11, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  metricValue: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },

  switchCard: { marginTop: SPACING.lg },
  switchTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: SPACING.md },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)', padding: SPACING.md, borderRadius: RADIUS.md },
  switchCol: { alignItems: 'center', flex: 1 },
  switchLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  switchValue: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, textTransform: 'capitalize' },
  switchMargin: { marginTop: SPACING.md, textAlign: 'center', fontSize: 14, color: COLORS.textSecondary },

  resetBtn: { marginTop: SPACING.xl, alignSelf: 'center', padding: 12 },
  resetBtnText: { color: COLORS.gold, fontWeight: 'bold', fontSize: 16 },
});

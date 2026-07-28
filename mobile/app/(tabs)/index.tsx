import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Platform, useWindowDimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../_layout';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useEffect, useState } from 'react';
import { COLORS, RADIUS, SHADOWS, SPACING, GRADIENTS } from '../../constants/theme';
import AgriBackground from '../../components/AgriBackground';
import GlassCard from '../../components/GlassCard';

import { useAuth } from '../_context/AuthContext';

const TAMIL_MONTHS = [
  { eng: 'January', tam: 'தை', season: 'Sunny', icon: 'sunny', bgImage: 'https://images.unsplash.com/photo-1542228262-3d663b306a53?q=80&w=600&auto=format&fit=crop', colors: ['rgba(245,158,11,0.2)', 'transparent'] },
  { eng: 'February', tam: 'மாசி', season: 'Mild', icon: 'partly-sunny', bgImage: 'https://images.unsplash.com/photo-1590418606746-018840f9cb25?q=80&w=600&auto=format&fit=crop', colors: ['rgba(252,211,77,0.2)', 'transparent'] },
  { eng: 'March', tam: 'பங்குனி', season: 'Sunny', icon: 'sunny', bgImage: 'https://images.unsplash.com/photo-1542228262-3d663b306a53?q=80&w=600&auto=format&fit=crop', colors: ['rgba(245,158,11,0.2)', 'transparent'] },
  { eng: 'April', tam: 'சித்திரை', season: 'Sunny', icon: 'sunny', bgImage: 'https://images.unsplash.com/photo-1542228262-3d663b306a53?q=80&w=600&auto=format&fit=crop', colors: ['rgba(245,158,11,0.3)', 'transparent'] },
  { eng: 'May', tam: 'வைகாசி', season: 'Sunny', icon: 'sunny', bgImage: 'https://images.unsplash.com/photo-1542228262-3d663b306a53?q=80&w=600&auto=format&fit=crop', colors: ['rgba(245,158,11,0.3)', 'transparent'] },
  { eng: 'June', tam: 'ஆனி', season: 'Warm', icon: 'partly-sunny', bgImage: 'https://images.unsplash.com/photo-1546853020-caa2b404d02f?q=80&w=600&auto=format&fit=crop', colors: ['rgba(252,211,77,0.2)', 'transparent'] },
  { eng: 'July', tam: 'ஆடி', season: 'Windy', icon: 'leaf', bgImage: 'https://images.unsplash.com/photo-1445264718234-a623be589d37?q=80&w=600&auto=format&fit=crop', colors: ['rgba(20,184,166,0.2)', 'transparent'] },
  { eng: 'August', tam: 'ஆவணி', season: 'Rainy', icon: 'rainy', bgImage: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=600&auto=format&fit=crop', colors: ['rgba(59,130,246,0.2)', 'transparent'] },
  { eng: 'September', tam: 'புரட்டாசி', season: 'Rainy', icon: 'rainy', bgImage: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=600&auto=format&fit=crop', colors: ['rgba(59,130,246,0.2)', 'transparent'] },
  { eng: 'October', tam: 'ஐப்பசி', season: 'Heavy Rain', icon: 'thunderstorm', bgImage: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=600&auto=format&fit=crop', colors: ['rgba(30,58,138,0.3)', 'transparent'] },
  { eng: 'November', tam: 'கார்த்திகை', season: 'Heavy Rain', icon: 'thunderstorm', bgImage: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=600&auto=format&fit=crop', colors: ['rgba(30,58,138,0.3)', 'transparent'] },
  { eng: 'December', tam: 'மார்கழி', season: 'Cold/Dew', icon: 'snow', bgImage: 'https://images.unsplash.com/photo-1547986060-1e5f88fc8654?q=80&w=600&auto=format&fit=crop', colors: ['rgba(167,139,250,0.2)', 'transparent'] },
];

function ThirukkuralBanner() {
  return (
    <GlassCard style={{ marginBottom: SPACING.xl, padding: SPACING.lg, overflow: 'hidden' }}>
      <LinearGradient colors={['rgba(212,175,55,0.1)', 'transparent']} style={StyleSheet.absoluteFillObject} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Ionicons name="book" size={32} color={COLORS.gold} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '500', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', color: COLORS.gold, lineHeight: 26, textAlign: 'center', letterSpacing: 0.5 }}>
            ✨ சுழன்றும்ஏர்ப் பின்னது உலகம் அதனால் ✨{'\n'}🌾 உழந்தும் உழவே தலை. 🌾
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}

function TamilCalendarCard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthData = TAMIL_MONTHS[currentDate.getMonth()];
  const day = currentDate.getDate();

  return (
    <GlassCard style={{ padding: SPACING.xl, overflow: 'hidden', height: '100%', justifyContent: 'center' }}>
      <Image source={{ uri: monthData.bgImage }} style={[StyleSheet.absoluteFillObject, { opacity: 0.4 }]} resizeMode="cover" blurRadius={2} />
      <LinearGradient colors={monthData.colors as any} style={StyleSheet.absoluteFillObject} />
      <View style={{ alignItems: 'center' }}>
        <Ionicons name={monthData.icon as any} size={48} color={COLORS.gold} style={{ marginBottom: SPACING.md }} />
        <Text style={{ fontSize: 64, fontWeight: '900', color: COLORS.textPrimary }}>{day}</Text>
        <Text style={{ fontSize: 42, fontWeight: 'bold', color: COLORS.gold, marginVertical: 8, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>{monthData.tam}</Text>
        <Text style={{ fontSize: 18, color: COLORS.textSecondary, fontWeight: '600' }}>{monthData.eng} • {monthData.season}</Text>
      </View>
    </GlassCard>
  );
}

function FeatureCard({ title, description, buttonText, icon, onPress, delay }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const onPressIn = () => Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }], marginBottom: SPACING.md, flex: 1 }}>
      {Platform.OS === 'web' && (
        <style dangerouslySetInnerHTML={{__html: `
          .feature-card-${title.replace(/[^a-zA-Z]/g, '')} { transition: all 0.3s ease; height: 100%; }
          .feature-card-${title.replace(/[^a-zA-Z]/g, '')}:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(212, 175, 55, 0.15); }
        `}} />
      )}
      <TouchableOpacity activeOpacity={0.9} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={{ flex: 1 }}>
        <GlassCard style={Platform.OS === 'web' ? { className: `feature-card-${title.replace(/[^a-zA-Z]/g, '')}`, padding: SPACING.lg, flex: 1 } as any : { padding: SPACING.lg, flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md }}>
            <View style={styles.featureIconWrap}>
              <MaterialIcons name={icon} size={28} color={COLORS.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>{title}</Text>
              <Text style={styles.featureDesc}>{description}</Text>
              <View style={styles.featureBtn}>
                <Text style={styles.featureBtnText}>{buttonText}</Text>
                <MaterialIcons name="arrow-forward" size={16} color={COLORS.darkBg} />
              </View>
            </View>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const { isTamil } = useApp();
  const { profile } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(heroSlide, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <AgriBackground />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThirukkuralBanner />
        
        <Animated.View style={[styles.heroSection, { opacity: heroOpacity, transform: [{ translateY: heroSlide }] }]}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.greeting}>{isTamil ? `வணக்கம், ${profile?.username || 'விவசாயி'}` : `Hello, ${profile?.username || 'Farmer'}`}</Text>
              <Text style={styles.heroTitle}>{isTamil ? 'இன்றைய நிலை' : 'Today\'s Overview'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {!isDesktop && (
                <TouchableOpacity onPress={() => router.push('/settings')} style={styles.mobileSettingsBtn}>
                  <Ionicons name="settings-outline" size={24} color={COLORS.gold} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>

        {isDesktop ? (
          <View style={{ flexDirection: 'row', gap: SPACING.lg }}>
            <View style={{ flex: 2 }}>
              <FeatureCard
                title={isTamil ? "நவீன விவசாயம்" : "Modern Farming"}
                description={isTamil ? "ஹைட்ரோபோனிக்ஸ், செங்குத்து விவசாயம், ஏரோபோனிக்ஸ் மற்றும் ட்ரோன் பயன்பாடு." : "Learn about Hydroponics, Vertical Farming, Aeroponics, and Agricultural Drones."}
                buttonText={isTamil ? "வழிகாட்டியைப் பார்க்க" : "View Guide"}
                icon="grass" delay={100} onPress={() => router.push('/vertical-farming')}
              />
              <FeatureCard
                title={isTamil ? "இயற்கை உரம் தயாரிப்பு" : "Organic Fertilizer Guide"}
                description={isTamil ? "பஞ்சகவ்யா, ஜீவாமிர்தம் போன்ற இயற்கை உரங்களை எளிதாக தயாரிக்கும் முறை." : "Learn how to make Panchagavya, Jeevamrutham, and other organic fertilizers at home."}
                buttonText={isTamil ? "வழிகாட்டியைப் பார்க்க" : "View Guide"}
                icon="eco" delay={200} onPress={() => router.push('/organic-fertilizer')}
              />
            </View>
            <View style={{ flex: 1 }}>
              <TamilCalendarCard />
            </View>
          </View>
        ) : (
          <View>
            <FeatureCard
              title={isTamil ? "நவீன விவசாயம்" : "Modern Farming"}
              description={isTamil ? "ஹைட்ரோபோனிக்ஸ், செங்குத்து விவசாயம், ஏரோபோனிக்ஸ் மற்றும் ட்ரோன் பயன்பாடு." : "Learn about Hydroponics, Vertical Farming, Aeroponics, and Agricultural Drones."}
              buttonText={isTamil ? "வழிகாட்டியைப் பார்க்க" : "View Guide"}
              icon="grass" delay={100} onPress={() => router.push('/vertical-farming')}
            />
            <FeatureCard
              title={isTamil ? "இயற்கை உரம் தயாரிப்பு" : "Organic Fertilizer Guide"}
              description={isTamil ? "பஞ்சகவ்யா, ஜீவாமிர்தம் போன்ற இயற்கை உரங்களை எளிதாக தயாரிக்கும் முறை." : "Learn how to make Panchagavya, Jeevamrutham, and other organic fertilizers at home."}
              buttonText={isTamil ? "வழிகாட்டியைப் பார்க்க" : "View Guide"}
              icon="eco" delay={200} onPress={() => router.push('/organic-fertilizer')}
            />
            <View style={{ marginTop: SPACING.md }}>
              <TamilCalendarCard />
            </View>
          </View>
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', backgroundColor: COLORS.darkBg },
  scroll: { flex: 1 },
  content: { padding: SPACING.md, paddingTop: SPACING.md, width: '100%', maxWidth: 1000, alignSelf: 'center' },
  heroSection: { marginBottom: SPACING.xl, marginTop: SPACING.sm },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  greeting: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
  heroTitle: { fontSize: 32, fontWeight: '900', color: COLORS.textPrimary },
  scoreBadge: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(212,175,55,0.15)', borderWidth: 2, borderColor: COLORS.gold, justifyContent: 'center', alignItems: 'center', ...SHADOWS.cardGold },
  scoreText: { fontSize: 24, fontWeight: '900', color: COLORS.gold },
  scoreLabel: { fontSize: 10, color: COLORS.gold, fontWeight: 'bold', textTransform: 'uppercase' },
  mobileSettingsBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  featureIconWrap: { width: 48, height: 48, borderRadius: RADIUS.md, backgroundColor: 'rgba(212,175,55,0.15)', justifyContent: 'center', alignItems: 'center' },
  featureTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 8 },
  featureDesc: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: SPACING.lg },
  featureBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: COLORS.gold, paddingHorizontal: SPACING.md, paddingVertical: 8, borderRadius: RADIUS.pill },
  featureBtnText: { color: COLORS.darkBg, fontWeight: 'bold', fontSize: 14, marginRight: 4 }
});

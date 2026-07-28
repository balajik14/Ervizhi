import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Image, useWindowDimensions,
  ScrollView, Alert, ActivityIndicator, Animated
} from 'react-native';
import { useRouter, useFocusEffect, Redirect } from 'expo-router';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useApp } from './_layout';
import { useAuth } from './_context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SHADOWS, SPACING, GRADIENTS } from '../constants/theme';

export default function AuthScreen() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <LinearGradient colors={GRADIENTS.darkBg} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </LinearGradient>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <AuthForm />;
}

function AuthForm() {
  const { isTamil, toggleLanguage } = useApp();
  const { loginLocal, sendOTP, verifyOtpOnly, verifyOTPAndRegister } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setUsername(''); setLoginUsername(''); setPassword('');
      setEmail(''); setOtp(''); setOtpSent(false); setOtpVerified(false);
      setMode('login'); setIsLoading(false); setErrorMsg(null);
    }, [])
  );

  const handleLogin = async () => {
    setErrorMsg(null);
    if (!loginUsername.trim() || !password.trim()) {
      const msg = isTamil ? 'பயனர் பெயர் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.' : 'Please enter both username and password.';
      setErrorMsg(msg);
      Alert.alert(isTamil ? 'பிழை' : 'Error', msg);
      return;
    }
    setIsLoading(true);
    try {
      await loginLocal(loginUsername.trim(), password);
    } catch (e: any) {
      const msg = e.message || 'Invalid username or password.';
      setErrorMsg(msg);
      Alert.alert(isTamil ? 'உள்நுழைவு தோல்வி' : 'Login Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    setErrorMsg(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setErrorMsg(isTamil ? 'சரியான மின்னஞ்சலை உள்ளிடவும்.' : 'Please enter a valid email.');
      return;
    }
    setIsLoading(true);
    try {
      const receivedOtp = await sendOTP(email.trim(), mode === 'register' ? 'register' : 'forgot');
      setOtpSent(true);
      if (receivedOtp) {
        setOtp(receivedOtp);
      }
      Alert.alert(
        isTamil ? 'OTP அனுப்பப்பட்டது' : 'OTP Sent',
        receivedOtp
          ? (isTamil ? `OTP உருவாக்கப்பட்டது (${receivedOtp}).` : `OTP generated for testing: ${receivedOtp}`)
          : (isTamil
              ? `உங்கள் மின்னஞ்சலுக்கு (${email}) சரிபார்ப்பு குறியீடு அனுப்பப்பட்டது. தயவுசெய்து உங்கள் inbox சரிபார்க்கவும்.`
              : `A verification code has been sent to ${email}. Please check your inbox (and spam folder).`)
      );
    } catch (e: any) {
      const msg = e.message || 'Failed to send OTP.';
      if (msg.includes('already registered')) {
        Alert.alert(
          isTamil ? 'கணக்கு உள்ளது' : 'Account Exists',
          isTamil ? 'இந்த மின்னஞ்சல் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது. தயவுசெய்து உள்நுழையவும்.' : 'This email is already registered. Please login instead.',
          [{ text: isTamil ? 'உள்நுழைய' : 'Go to Login', onPress: () => setMode('login') }]
        );
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMsg(null);
    if (!otp.trim()) {
      setErrorMsg(isTamil ? 'சரிபார்ப்பு குறியீட்டை உள்ளிடவும்.' : 'Please enter the verification OTP.');
      return;
    }
    setIsLoading(true);
    try {
      await verifyOtpOnly(email.trim(), otp.trim());
      setOtpVerified(true);
    } catch (e: any) {
      setErrorMsg(e.message || 'Invalid OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterFinal = async () => {
    setErrorMsg(null);
    if (!username.trim() || !password.trim()) {
      setErrorMsg(isTamil ? 'விவரங்களை உள்ளிடவும்.' : 'Please enter a username and password.');
      return;
    }
    setIsLoading(true);
    try {
      await verifyOTPAndRegister(email.trim(), username.trim(), password, otp.trim());
    } catch (e: any) {
      setErrorMsg(e.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = (field: string) => [
    styles.input,
    focusedInput === field && styles.inputFocused,
  ];

  return (
    <LinearGradient colors={GRADIENTS.heroBg} style={styles.container}>
      <LinearGradient
        colors={GRADIENTS.loginOverlay}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={[styles.scroll, isDesktop && styles.scrollDesktop]} showsVerticalScrollIndicator={false}>

          {/* Language Toggle */}
          <View style={styles.langToggle}>
            <TouchableOpacity
              style={[styles.langBtn, !isTamil && styles.langBtnActive]}
              onPress={() => !isTamil ? null : toggleLanguage()}
            >
              <Text style={[styles.langText, !isTamil && styles.langTextActive]}>EN</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langBtn, isTamil && styles.langBtnActive]}
              onPress={() => isTamil ? null : toggleLanguage()}
            >
              <Text style={[styles.langText, isTamil && styles.langTextActive]}>தமிழ்</Text>
            </TouchableOpacity>
          </View>

          {/* Logo + Title */}
          <Animated.View style={[styles.logoArea, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.logoRing}>
              <Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
            </View>
            <Text style={styles.titleTamil}>ஏர்விழி</Text>
            <Text style={styles.titleEn}>Ervizhi</Text>
            <Text style={styles.tagline}>
              {isTamil ? 'ஸ்மார்ட் விவசாய துணைவன்' : 'Smart Farming Companion'}
            </Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View style={[styles.formCard, isDesktop && styles.formCardDesktop, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.formCardInner}>
              <Text style={styles.formTitle}>
                {mode === 'login'
                  ? (isTamil ? 'உங்கள் கணக்கில் நுழைய' : 'Login to Your Profile')
                  : (isTamil ? 'புதிய கணக்கை உருவாக்கு' : 'Create Your Profile')}
              </Text>

              {mode === 'login' && (
                <>
                  <Text style={styles.label}>{isTamil ? 'பயனர் பெயர்' : 'Username'}</Text>
                  <TextInput
                    style={inputStyle('loginUser')}
                    placeholder={isTamil ? 'பயனர் பெயர் உள்ளிடவும்' : 'Enter username'}
                    value={loginUsername}
                    onChangeText={setLoginUsername}
                    autoCapitalize="none"
                    placeholderTextColor={COLORS.textMuted}
                    onFocus={() => setFocusedInput('loginUser')}
                    onBlur={() => setFocusedInput(null)}
                    editable={!isLoading}
                  />
                  <Text style={styles.label}>{isTamil ? 'கடவுச்சொல்' : 'Password'}</Text>
                  <TextInput
                    style={inputStyle('loginPass')}
                    placeholder="••••••••"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    placeholderTextColor={COLORS.textMuted}
                    onFocus={() => setFocusedInput('loginPass')}
                    onBlur={() => setFocusedInput(null)}
                    editable={!isLoading}
                  />
                  
                  {errorMsg && (
                    <Text style={{ color: '#ef4444', marginBottom: 10, textAlign: 'center', fontSize: 14 }}>
                      {errorMsg}
                    </Text>
                  )}
                  
                  <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} disabled={isLoading}>
                    <View style={styles.primaryBtnGrad}>
                      {isLoading ? <ActivityIndicator color={COLORS.darkBg} /> : (
                        <Text style={styles.primaryBtnText}>{isTamil ? 'உள்நுழைய' : 'Secure Login'}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.secondaryBtn} onPress={() => setMode('register')} disabled={isLoading}>
                    <Text style={styles.secondaryBtnText}>
                      {isTamil ? 'கணக்கு இல்லையா? புதிய கணக்கை உருவாக்கு' : "Don't have an account? Create Profile"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {mode === 'register' && (
                <>
                  {!otpSent && !otpVerified && (
                    <>
                      <Text style={styles.label}>{isTamil ? 'மின்னஞ்சல்' : 'Email'}</Text>
                      <TextInput
                        style={inputStyle('email')}
                        placeholder={isTamil ? 'மின்னஞ்சல் உள்ளிடவும்' : 'Enter email address'}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholderTextColor={COLORS.textMuted}
                        onFocus={() => setFocusedInput('email')}
                        onBlur={() => setFocusedInput(null)}
                        editable={!isLoading}
                      />
                      <TouchableOpacity style={styles.primaryBtn} onPress={handleSendOTP} disabled={isLoading}>
                        <View style={styles.primaryBtnGrad}>
                          {isLoading ? <ActivityIndicator color={COLORS.darkBg} /> : (
                            <Text style={styles.primaryBtnText}>{isTamil ? 'OTP குறியீட்டை அனுப்பு' : 'Send Verification OTP'}</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    </>
                  )}
                  
                  {otpSent && !otpVerified && (
                    <>
                      <Text style={styles.label}>{isTamil ? 'சரிபார்ப்பு குறியீடு (OTP)' : 'Verification Code (OTP)'}</Text>
                      <TextInput
                        style={inputStyle('otp')}
                        placeholder="••••••"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        placeholderTextColor={COLORS.textMuted}
                        onFocus={() => setFocusedInput('otp')}
                        onBlur={() => setFocusedInput(null)}
                        editable={!isLoading}
                      />
                      <TouchableOpacity style={styles.primaryBtn} onPress={handleVerifyOtp} disabled={isLoading}>
                        <View style={styles.primaryBtnGrad}>
                          {isLoading ? <ActivityIndicator color={COLORS.darkBg} /> : (
                            <Text style={styles.primaryBtnText}>{isTamil ? 'OTP ஐ சரிபார்க்கவும்' : 'Verify OTP'}</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    </>
                  )}

                  {otpSent && otpVerified && (
                    <>
                      <Text style={styles.label}>{isTamil ? 'பயனர் பெயர்' : 'Choose Username'}</Text>
                      <TextInput
                        style={inputStyle('regUser')}
                        placeholder={isTamil ? 'பயனர் பெயர் உள்ளிடவும்' : 'Enter a username'}
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        placeholderTextColor={COLORS.textMuted}
                        onFocus={() => setFocusedInput('regUser')}
                        onBlur={() => setFocusedInput(null)}
                        editable={!isLoading}
                      />
                      <Text style={styles.label}>{isTamil ? 'கடவுச்சொல்' : 'Choose Password'}</Text>
                      <TextInput
                        style={inputStyle('regPass')}
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor={COLORS.textMuted}
                        onFocus={() => setFocusedInput('regPass')}
                        onBlur={() => setFocusedInput(null)}
                        editable={!isLoading}
                      />
                    </>
                  )}

                  {errorMsg && (
                    <Text style={{ color: '#ef4444', marginBottom: 10, textAlign: 'center', fontSize: 14 }}>
                      {errorMsg}
                    </Text>
                  )}

                  {otpSent && otpVerified && (
                    <TouchableOpacity style={styles.primaryBtn} onPress={handleRegisterFinal} disabled={isLoading}>
                      <View style={styles.primaryBtnGrad}>
                        {isLoading ? <ActivityIndicator color={COLORS.darkBg} /> : (
                          <Text style={styles.primaryBtnText}>{isTamil ? 'கணக்கை உருவாக்கு' : 'Create Account'}</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.secondaryBtn} onPress={() => setMode('login')} disabled={isLoading}>
                    <Text style={styles.secondaryBtnText}>
                      {isTamil ? 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழையவும்' : 'Already have an account? Login'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', opacity: 0.15 },
  keyboardContainer: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.md, paddingTop: 60 },
  scrollDesktop: { paddingTop: 40 },

  langToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.goldBorderSoft,
    overflow: 'hidden',
    padding: 3,
  },
  langBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: RADIUS.pill },
  langBtnActive: { backgroundColor: COLORS.gold },
  langText: { color: COLORS.textSecondary, fontWeight: '700', fontSize: 13 },
  langTextActive: { color: COLORS.darkBg },

  logoArea: { alignItems: 'center', marginBottom: SPACING.xl },
  logoRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2.5,
    borderColor: COLORS.goldBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(212,175,55,0.08)',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    overflow: 'hidden',
  },
  logo: { width: 95, height: 95, transform: [{ scale: 2.25 }, { translateY: 5 }] },
  titleTamil: {
    fontSize: 38,
    fontWeight: '900',
    color: COLORS.textGold,
    letterSpacing: 1,
    textShadow: '0px 2px 8px rgba(212,175,55,0.4)',
  } as any,
  titleEn: { fontSize: 18, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 3, marginTop: -4 },
  tagline: { fontSize: 13, color: COLORS.textMuted, marginTop: SPACING.sm, letterSpacing: 0.5 },

  formCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.goldBorderSoft,
    backgroundColor: 'rgba(6,95,70,0.5)',
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  formCardDesktop: { maxWidth: 420 },
  formCardInner: {
    padding: SPACING.lg,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  label: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 6, marginLeft: 2 },
  input: {
    backgroundColor: 'rgba(13,59,46,0.6)',
    borderWidth: 1,
    borderColor: COLORS.goldBorderSoft,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 20,
    paddingVertical: 13,
    marginBottom: SPACING.md,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  inputFocused: {
    borderColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  primaryBtn: { borderRadius: RADIUS.pill, overflow: 'hidden', marginTop: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.button },
  primaryBtnGrad: { paddingVertical: 15, alignItems: 'center', justifyContent: 'center', minHeight: 52, backgroundColor: COLORS.gold },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: COLORS.darkBg, letterSpacing: 0.3 },
  secondaryBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  secondaryBtnText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
});

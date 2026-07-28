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
import LeafLoader from '../components/LeafLoader';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SHADOWS, SPACING, GRADIENTS } from '../constants/theme';

export default function AuthScreen() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <LinearGradient colors={GRADIENTS.darkBg} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LeafLoader />
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
  const { loginLocal, sendOTP, verifyOtpOnly, verifyOTPAndRegister, resetPassword } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [username, setUsername] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
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
      setUsername(''); setLoginUsername(''); setPassword(''); setNewPassword('');
      setEmail(''); setOtp(''); setOtpSent(false); setOtpVerified(false);
      setMode('login'); setIsLoading(false); setErrorMsg(null); setSuccessMsg(null);
    }, [])
  );

  const handleLogin = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!loginUsername.trim() || !password.trim()) {
      const msg = isTamil ? 'பயனர் பெயர் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.' : 'Please enter both username/email and password.';
      setErrorMsg(msg);
      return;
    }
    setIsLoading(true);
    try {
      await loginLocal(loginUsername.trim(), password);
    } catch (e: any) {
      const msg = e.message || 'Invalid username or password.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMsg(isTamil ? 'சரியான மின்னஞ்சலை உள்ளிடவும்.' : 'Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    try {
      const receivedOtp = await sendOTP(email.trim(), mode === 'forgot' ? 'forgot' : 'register');
      setOtpSent(true);
      if (receivedOtp) {
        setOtp(receivedOtp);
      }
      setSuccessMsg(
        isTamil
          ? `மின்னஞ்சலுக்கு சரிபார்ப்பு OTP அனுப்பப்பட்டது (${receivedOtp || 'Sent'}).`
          : `Verification OTP code generated (${receivedOtp || 'Sent via email'}).`
      );
    } catch (e: any) {
      const msg = e.message || 'Failed to send OTP.';
      if (msg.includes('already registered')) {
        setErrorMsg(isTamil ? 'இந்த மின்னஞ்சல் ஏற்கனவே உள்ளது. உள்நுழையவும்.' : 'This email is already registered. Please login.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!otp.trim()) {
      setErrorMsg(isTamil ? 'சரிபார்ப்பு குறியீட்டை உள்ளிடவும்.' : 'Please enter the verification OTP.');
      return;
    }
    setIsLoading(true);
    try {
      await verifyOtpOnly(email.trim(), otp.trim());
      setOtpVerified(true);
      setSuccessMsg(isTamil ? 'OTP சரிபார்க்கப்பட்டது! விவரங்களை பூர்த்தி செய்யவும்.' : 'OTP Verified! Please set your username and password.');
    } catch (e: any) {
      setErrorMsg(e.message || 'Invalid or expired OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterFinal = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
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

  const handleResetPassword = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!email.trim() || !otp.trim() || !newPassword.trim()) {
      setErrorMsg(isTamil ? 'அனைத்து விவரங்களையும் உள்ளிடவும்.' : 'Please enter email, OTP, and new password.');
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword(email.trim(), otp.trim(), newPassword.trim());
      Alert.alert(
        isTamil ? 'வெற்றி' : 'Success',
        isTamil ? 'கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது. புதிய கடவுச்சொல்லுடன் உள்நுழையவும்.' : 'Password reset successfully. Please login with your new password.',
        [{ text: 'OK', onPress: () => { setMode('login'); setErrorMsg(null); } }]
      );
    } catch (e: any) {
      setErrorMsg(e.message || 'Password reset failed.');
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
                {mode === 'login' && (isTamil ? 'உங்கள் கணக்கில் நுழைய' : 'Login to Your Profile')}
                {mode === 'register' && (isTamil ? 'புதிய கணக்கை உருவாக்கு' : 'Create Your Profile')}
                {mode === 'forgot' && (isTamil ? 'கடவுச்சொல்லை மீட்டமைக்க' : 'Reset Password')}
              </Text>

              {/* Status Notifications */}
              {errorMsg && (
                <View style={styles.errorBox}>
                  <MaterialIcons name="error-outline" size={18} color="#ef4444" style={{ marginRight: 6 }} />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}

              {successMsg && (
                <View style={styles.successBox}>
                  <MaterialIcons name="check-circle-outline" size={18} color="#10b981" style={{ marginRight: 6 }} />
                  <Text style={styles.successText}>{successMsg}</Text>
                </View>
              )}

              {/* LOGIN MODE */}
              {mode === 'login' && (
                <>
                  <Text style={styles.label}>{isTamil ? 'பயனர் பெயர் அல்லது மின்னஞ்சல்' : 'Username or Email'}</Text>
                  <TextInput
                    style={inputStyle('loginUser')}
                    placeholder={isTamil ? 'பயனர் பெயர் / மின்னஞ்சல் உள்ளிடவும்' : 'Enter username or email'}
                    value={loginUsername}
                    onChangeText={setLoginUsername}
                    autoCapitalize="none"
                    placeholderTextColor={COLORS.textMuted}
                    onFocus={() => setFocusedInput('loginUser')}
                    onBlur={() => setFocusedInput(null)}
                    editable={!isLoading}
                  />
                  
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>{isTamil ? 'கடவுச்சொல்' : 'Password'}</Text>
                    <TouchableOpacity onPress={() => { setMode('forgot'); setErrorMsg(null); setSuccessMsg(null); }}>
                      <Text style={styles.forgotLink}>{isTamil ? 'கடவுச்சொல் மறந்துவிட்டதா?' : 'Forgot Password?'}</Text>
                    </TouchableOpacity>
                  </View>
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
                  
                  <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} disabled={isLoading}>
                    <View style={styles.primaryBtnGrad}>
                      {isLoading ? <ActivityIndicator color={COLORS.darkBg} /> : (
                        <Text style={styles.primaryBtnText}>{isTamil ? 'உள்நுழைய' : 'Secure Login'}</Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.secondaryBtn} onPress={() => { setMode('register'); setErrorMsg(null); setSuccessMsg(null); }} disabled={isLoading}>
                    <Text style={styles.secondaryBtnText}>
                      {isTamil ? 'கணக்கு இல்லையா? புதிய கணக்கை உருவாக்கு' : "Don't have an account? Create Profile"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* REGISTER MODE */}
              {mode === 'register' && (
                <>
                  {!otpSent && !otpVerified && (
                    <>
                      <Text style={styles.label}>{isTamil ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}</Text>
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
                        placeholder={isTamil ? 'பயனர் பெயர் உள்ளிடவும்' : 'Enter username'}
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
                      <TouchableOpacity style={styles.primaryBtn} onPress={handleRegisterFinal} disabled={isLoading}>
                        <View style={styles.primaryBtnGrad}>
                          {isLoading ? <ActivityIndicator color={COLORS.darkBg} /> : (
                            <Text style={styles.primaryBtnText}>{isTamil ? 'கணக்கை உருவாக்கு' : 'Create Account'}</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    </>
                  )}

                  <TouchableOpacity style={styles.secondaryBtn} onPress={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }} disabled={isLoading}>
                    <Text style={styles.secondaryBtnText}>
                      {isTamil ? 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழையவும்' : 'Already have an account? Login'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* FORGOT PASSWORD MODE */}
              {mode === 'forgot' && (
                <>
                  <Text style={styles.label}>{isTamil ? 'மின்னஞ்சல் முகவரி' : 'Account Email Address'}</Text>
                  <TextInput
                    style={inputStyle('forgotEmail')}
                    placeholder={isTamil ? 'மின்னஞ்சல் உள்ளிடவும்' : 'Enter account email'}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholderTextColor={COLORS.textMuted}
                    onFocus={() => setFocusedInput('forgotEmail')}
                    onBlur={() => setFocusedInput(null)}
                    editable={!isLoading}
                  />

                  {!otpSent && (
                    <TouchableOpacity style={styles.primaryBtn} onPress={handleSendOTP} disabled={isLoading}>
                      <View style={styles.primaryBtnGrad}>
                        {isLoading ? <ActivityIndicator color={COLORS.darkBg} /> : (
                          <Text style={styles.primaryBtnText}>{isTamil ? 'OTP குறியீட்டை அனுப்பு' : 'Send Reset OTP'}</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  )}

                  {otpSent && (
                    <>
                      <Text style={styles.label}>{isTamil ? 'சரிபார்ப்பு குறியீடு (OTP)' : 'Verification Code (OTP)'}</Text>
                      <TextInput
                        style={inputStyle('forgotOtp')}
                        placeholder="••••••"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        placeholderTextColor={COLORS.textMuted}
                        onFocus={() => setFocusedInput('forgotOtp')}
                        onBlur={() => setFocusedInput(null)}
                        editable={!isLoading}
                      />

                      <Text style={styles.label}>{isTamil ? 'புதிய கடவுச்சொல்' : 'New Password'}</Text>
                      <TextInput
                        style={inputStyle('newPass')}
                        placeholder="••••••••"
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholderTextColor={COLORS.textMuted}
                        onFocus={() => setFocusedInput('newPass')}
                        onBlur={() => setFocusedInput(null)}
                        editable={!isLoading}
                      />

                      <TouchableOpacity style={styles.primaryBtn} onPress={handleResetPassword} disabled={isLoading}>
                        <View style={styles.primaryBtnGrad}>
                          {isLoading ? <ActivityIndicator color={COLORS.darkBg} /> : (
                            <Text style={styles.primaryBtnText}>{isTamil ? 'கடவுச்சொல்லை மீட்டமைக்கவும்' : 'Reset Password'}</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    </>
                  )}

                  <TouchableOpacity style={styles.secondaryBtn} onPress={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }} disabled={isLoading}>
                    <Text style={styles.secondaryBtnText}>
                      {isTamil ? 'உள்நுழைவுக்குத் திரும்பு' : 'Back to Login'}
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
    zIndex: 10,
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
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 6, marginLeft: 2 },
  forgotLink: { fontSize: 12, color: COLORS.gold, fontWeight: '600' },
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorText: { color: '#ef4444', fontSize: 13, fontWeight: '600', flex: 1 },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  successText: { color: '#10b981', fontSize: 13, fontWeight: '600', flex: 1 },

  primaryBtn: { borderRadius: RADIUS.pill, overflow: 'hidden', marginTop: SPACING.sm, marginBottom: SPACING.sm, ...SHADOWS.button },
  primaryBtnGrad: { paddingVertical: 15, alignItems: 'center', justifyContent: 'center', minHeight: 52, backgroundColor: COLORS.gold },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: COLORS.darkBg, letterSpacing: 0.3 },
  secondaryBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  secondaryBtnText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
});


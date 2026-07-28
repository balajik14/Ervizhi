import { Stack, useRouter, useSegments } from 'expo-router';
import { useColorScheme, ActivityIndicator, View, ImageBackground } from 'react-native';
import { ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createContext, useState, useContext, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './_context/AuthContext';
import { COLORS } from '../constants/theme';
import { PADDY_BG } from '../constants/Images';
import CornerOrnament from '../components/CornerOrnament';
import LeafLoader from '../components/LeafLoader';
import 'leaflet/dist/leaflet.css';

// ─── App Settings Context (language, theme) ─────────────────────────
export const AppContext = createContext({
  isTamil: false,
  toggleLanguage: () => {},
  isDarkMode: false,
  toggleTheme: () => {},
});

export const useApp = () => useContext(AppContext);

// ─── Themes ─────────────────────────────────────────────────────────
const NatureGreenTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.gold,
    background: COLORS.darkBg,
    card: COLORS.cardBg,
    text: COLORS.textPrimary,
    border: COLORS.goldBorderSoft,
    notification: COLORS.goldGlow,
  },
};

const DarkNatureGreenTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: COLORS.gold,
    background: COLORS.darkBg,
    card: COLORS.cardBg,
    text: COLORS.textPrimary,
    border: COLORS.goldBorderSoft,
    notification: COLORS.goldGlow,
  },
};

// ─── Inner Layout (uses auth state) ─────────────────────────────────
// isLoading is ONLY true during the very first app boot (session restore).
// After that it stays false permanently — login/register do NOT change it.
// The Stack must never be conditionally unmounted after boot (breaks navigation).
function InnerLayout() {
  const { isLoading, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inTabsGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && inTabsGroup) {
      router.replace('/');
    } else if (isAuthenticated && (!segments.length || (segments[0] as string) === 'index')) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.darkBg }}>
        <LeafLoader />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.darkBg }}>
      <ImageBackground source={PADDY_BG} style={{ flex: 1, width: '100%', height: '100%' }} imageStyle={{ opacity: 0.05, resizeMode: 'cover' }}>
        <CornerOrnament />
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ImageBackground>
    </View>
  );
}


// ─── Root Layout ────────────────────────────────────────────────────
export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const [isTamil, setIsTamil] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  const toggleLanguage = () => setIsTamil(!isTamil);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <AuthProvider>
      <AppContext.Provider value={{ isTamil, toggleLanguage, isDarkMode, toggleTheme }}>
        <ThemeProvider value={isDarkMode ? DarkNatureGreenTheme : NatureGreenTheme}>
          <SafeAreaProvider>
            <InnerLayout />
          </SafeAreaProvider>
        </ThemeProvider>
      </AppContext.Provider>
    </AuthProvider>
  );
}

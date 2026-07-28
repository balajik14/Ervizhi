import { router, usePathname, Redirect, withLayoutContext } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../_layout';
import { useAuth } from '../_context/AuthContext';
import { useWindowDimensions, View, Text, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useEffect } from 'react';
import { COLORS, RADIUS, GRADIENTS, SHADOWS } from '../../constants/theme';

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

// ── Global Menu Configurations ─────────────────────────────────────────
const menuItemsEn = [
  { name: 'index', title: 'Home', icon: 'home', route: '/' },
  { name: 'farm', title: 'Farm', icon: 'leaf', route: '/farm' },
  { name: 'soil-map', title: 'Soil Map', icon: 'map', route: '/soil-map' },
  { name: 'trade', title: 'Trade', icon: 'cart', route: '/trade' },
  { name: 'machinery', title: 'Machinery', icon: 'construct', route: '/machinery' },
  { name: 'oottam', title: 'Oottam', icon: 'nutrition', route: '/oottam' },
  { name: 'settings', title: 'Settings', icon: 'settings', route: '/settings' },
];

const menuItemsTa = [
  { name: 'index', title: 'முகப்பு', icon: 'home', route: '/' },
  { name: 'farm', title: 'விவசாயம்', icon: 'leaf', route: '/farm' },
  { name: 'soil-map', title: 'மண் வரைபடம்', icon: 'map', route: '/soil-map' },
  { name: 'trade', title: 'வியாபாரம்', icon: 'cart', route: '/trade' },
  { name: 'machinery', title: 'இயந்திரங்கள்', icon: 'construct', route: '/machinery' },
  { name: 'oottam', title: 'ஊட்டம்', icon: 'nutrition', route: '/oottam' },
  { name: 'settings', title: 'அமைப்புகள்', icon: 'settings', route: '/settings' },
];

// ── Animated Sidebar Item ─────────────────────────────────────────────
function SidebarItem({ item, isActive, onPress }: { item: any; isActive: boolean; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }], marginBottom: 4 }}>
      <TouchableOpacity
        style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.85}
      >
        {isActive && <View style={styles.activeIndicator} />}
        
        <View style={styles.iconWrap}>
          <Ionicons
            name={isActive ? (item.icon as any) : (`${item.icon}-outline` as any)}
            size={22}
            color={isActive ? COLORS.gold : COLORS.textSecondary}
          />
        </View>
        
        <Text style={[styles.sidebarItemText, isActive && styles.sidebarItemTextActive]}>
          {item.title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Standalone Sidebar Component ───────────────────────────────────────
function Sidebar() {
  const { isTamil } = useApp();
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const isDesktop = width > 768;
  const menuItems = isTamil ? menuItemsTa : menuItemsEn;

  if (!isDesktop) return null;

  return (
    <View style={styles.floatingSidebarContainer}>
      <LinearGradient
        colors={['rgba(13,75,56,0.92)', 'rgba(3,59,45,0.95)', '#062E25']}
        style={styles.sidebar}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Logo Header */}
        <View style={styles.sidebarHeader}>
          <View style={styles.logoGlowRing}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.sidebarLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.sidebarBrand}>Ervizhi</Text>
          <Text style={styles.sidebarTagline}>{isTamil ? 'ஸ்மார்ட் விவசாய துணைவன்' : 'Smart Agriculture Platform'}</Text>
          <View style={styles.goldDivider} />
        </View>

        {/* Nav Items */}
        <View style={styles.navItems}>
          {menuItems.map((item) => {
            const isActive = pathname === item.route || (item.route === '/' && (pathname === '/' || pathname === '/index'));
            return (
              <SidebarItem
                key={item.name}
                item={item}
                isActive={isActive}
                onPress={() => router.push(item.route as any)}
              />
            );
          })}
        </View>

        {/* Bottom badge */}
        <View style={styles.sidebarFooter}>
          <View style={styles.footerBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.footerText}>Flagship Agriculture • v2.0</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// ── Standalone Custom Tab Bar Component ────────────────────────────────
function CustomTabBar({ state, navigation }: any) {
  const { isTamil } = useApp();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isDesktop = width > 768;
  const menuItems = isTamil ? menuItemsTa : menuItemsEn;

  if (isDesktop) return null;

  return (
    <View
      style={{
        flexDirection: 'row',
        width: '100%',
        height: 62 + insets.bottom,
        paddingBottom: insets.bottom,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.goldBorderSoft,
        backgroundColor: 'rgba(6,95,70,0.85)',
      }}
    >
      {menuItems.filter(item => item.name !== 'settings').map((item) => {
        const isFocused = state.routes[state.index].name === item.name;
        return (
          <TouchableOpacity
            key={item.name}
            onPress={() => navigation.navigate(item.name)}
            style={styles.tabBarItem}
            activeOpacity={0.75}
          >
            <Ionicons
              name={isFocused ? (item.icon as any) : (`${item.icon}-outline` as any)}
              size={22}
              color={isFocused ? COLORS.gold : COLORS.textMuted}
            />
            <Text style={{ fontSize: 11, fontWeight: isFocused ? '700' : '500', color: isFocused ? COLORS.gold : COLORS.textMuted, marginTop: 2 }}>
              {item.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── TabLayout Navigator ───────────────────────────────────────────────
export default function TabLayout() {
  const { isTamil } = useApp();
  const { isAuthenticated } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;
  const menuItems = isTamil ? menuItemsTa : menuItemsEn;

  return (
    <View style={{ flexDirection: 'row', flex: 1, width: '100%', backgroundColor: COLORS.darkBg }}>
      {isDesktop && <Sidebar />}
      <View style={{ flex: 1, width: isDesktop ? 'auto' : '100%' }}>
          <MaterialTopTabs
            tabBarPosition="bottom"
            tabBar={CustomTabBar}
            screenOptions={{
              swipeEnabled: false,
              animationEnabled: false,
            } as any}
          >
          {menuItems.map((item) => (
            <MaterialTopTabs.Screen
              key={item.name}
              name={item.name}
              options={{ title: item.title }}
            />
          ))}
          {/* Hidden Screens */}
          <MaterialTopTabs.Screen name="plan" />
          <MaterialTopTabs.Screen name="growth" />
          <MaterialTopTabs.Screen name="market" />
          <MaterialTopTabs.Screen name="export" />
          <MaterialTopTabs.Screen name="harvest" />
          <MaterialTopTabs.Screen name="vertical-farming" />
          <MaterialTopTabs.Screen name="organic-fertilizer" />
        </MaterialTopTabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Sidebar ──────────────────────────────────────────────────────
  floatingSidebarContainer: {
    paddingVertical: 16,
    paddingLeft: 16,
  },
  sidebar: {
    width: 250,
    height: '100%',
    paddingTop: 36,
    paddingHorizontal: 14,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.goldBorderSoft,
    ...SHADOWS.card,
  },
  sidebarHeader: {
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 16,
  },
  logoGlowRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: COLORS.goldBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    overflow: 'hidden',
  },
  sidebarLogo: {
    width: 90,
    height: 90,
    transform: [{ scale: 2.15 }, { translateY: 4.5 }],
  },
  sidebarBrand: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textGold,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  sidebarTagline: {
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  goldDivider: {
    height: 1,
    width: '80%',
    backgroundColor: COLORS.goldBorderSoft,
    borderRadius: 1,
  },
  navItems: {
    flex: 1,
    paddingTop: 8,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    marginBottom: 4,
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  sidebarItemActive: {
    backgroundColor: 'rgba(212,175,55,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3.5,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  iconWrap: {
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarItemText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  sidebarItemTextActive: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  sidebarFooter: {
    paddingBottom: 24,
    paddingTop: 8,
    alignItems: 'center',
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  footerText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  // ── Tab Bar ───────────────────────────────────────────────────────
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabIconActive: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconInactive: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
    marginTop: 2,
  },
});

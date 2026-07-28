/**
 * Ervizhi Premium Design System — Global Theme Tokens
 * Emerald Green + Royal Gold Luxury Theme
 */

export const COLORS = {
  // ── Primary Emeralds ────────────────────────────────────
  emerald: '#046A38',
  emeraldDark: '#005F3B',
  emeraldMid: '#0B5D3B',
  emeraldDeep: '#0F5132',
  deepEmerald: '#033B2D',
  forest: '#005F3B',

  // ── Surfaces & Backgrounds ──────────────────────────────
  darkBg: '#062E25',         // Flagship main background
  darkBg2: '#033B2D',        // Deep secondary background
  cardBg: '#0D4B38',         // Premium floating panel background
  cardHover: '#126246',      // Interactive card hover state
  cardBg2: '#0F5132',        // Elevated panel surface
  cardBorder: 'rgba(212,175,55,0.3)', // Subtle polished gold border

  // ── Polished Metallic Royal Gold ─────────────────────────
  gold: '#D4AF37',                     // Polished Royal Metallic Gold
  goldRich: '#C9A227',                 // Rich Warm Gold
  goldLight: '#E0B84C',                // Light Metallic Reflection Gold
  goldGlow: 'rgba(212,175,55,0.22)',    // Soft gold aura
  goldDim: 'rgba(212,175,55,0.12)',
  goldBorder: '#D4AF37',
  goldBorderSoft: 'rgba(212,175,55,0.35)', // Soft metallic border

  // ── Text ────────────────────────────────────────────────
  textPrimary: '#F0FDF4',     // Ultra-clean crisp cream white
  textSecondary: '#A7F3D0',   // Muted mint green
  textMuted: '#6EE7B7',       // Very muted green
  textGold: '#E0B84C',        // Polished Metallic Royal Gold text
  textDark: '#033B2D',        // Deep emerald text on gold buttons

  // ── Glass / Overlays ────────────────────────────────────
  glassCard: 'rgba(13,75,56,0.85)', // Glass panel background
  glassBorder: 'rgba(212,175,55,0.3)',
  glassOverlay: 'rgba(6,46,37,0.88)',
  inputBg: 'rgba(3,59,45,0.7)',
  inputBorder: 'rgba(212,175,55,0.3)',
  inputFocusBorder: '#E0B84C',

  // ── Status ──────────────────────────────────────────────
  success: '#10B981',
  danger: '#EF4444',
  dangerSoft: 'rgba(239,68,68,0.15)',

  // ── Chart ───────────────────────────────────────────────
  barNormal: '#0B5D3B',
  barBest: '#D4AF37',
};

const tintColorLight = '#046A38';
const tintColorDark = '#D4AF37';

export const Colors = {
  light: {
    text: '#033B2D',
    background: '#F0FDF4',
    tint: tintColorLight,
    icon: '#0B5D3B',
    tabIconDefault: '#046A38',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#F0FDF4',
    background: '#062E25',
    tint: tintColorDark,
    icon: '#A7F3D0',
    tabIconDefault: '#6EE7B7',
    tabIconSelected: tintColorDark,
  },
};

export const GRADIENTS = {
  // Flagship multi-stop reflection gradients
  darkBg: ['#062E25', '#033B2D', '#0D4B38'],
  card: ['rgba(13,75,56,0.95)', 'rgba(3,59,45,0.9)'],
  gold: ['#E0B84C', '#D4AF37', '#C9A227'],
  goldReverse: ['#C9A227', '#D4AF37', '#E0B84C'],
  emerald: ['#046A38', '#0B5D3B'],
  header: ['rgba(6,46,37,0.98)', 'rgba(3,59,45,0.95)'],
  loginOverlay: ['rgba(6,46,37,0.9)', 'rgba(3,59,45,0.85)', '#062E25'],
  heroBg: ['rgba(3,59,45,0.95)', 'rgba(13,75,56,0.9)'],
} as const;

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
    boxShadow: '0px 10px 24px rgba(0,0,0,0.45)',
  } as any,
  cardGold: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    boxShadow: '0px 6px 16px rgba(212,175,55,0.3)',
  } as any,
  input: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    boxShadow: '0px 3px 8px rgba(0,0,0,0.2)',
  } as any,
  button: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    boxShadow: '0px 8px 18px rgba(212,175,55,0.35)',
  } as any,
};

export const RADIUS = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 28,
  pill: 50,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

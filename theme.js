// MyHealth design tokens
// Direction from the product brief: clean white base, red as a controlled
// accent, rounded cards, generous spacing, accessible type, calm & trustworthy.

export const colors = {
  background: '#FCFCFD',
  surface: '#FFFFFF',
  surfaceMuted: '#F6F7F9',
  border: '#ECEDF1',

  textPrimary: '#14161A',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  primary: '#D7263D',       // controlled clinical red
  primarySoft: '#FDECEE',
  primaryDark: '#AE1E31',

  success: '#1B9C6E',
  successSoft: '#E7F7F1',
  warning: '#B7791F',
  warningSoft: '#FBF1DE',
  info: '#2563A6',
  infoSoft: '#E9F1FA',
  danger: '#C4293B',
  dangerSoft: '#FBEAEC',

  emergency: '#D7263D',
  emergencySoft: '#FDECEE',

  white: '#FFFFFF',
  black: '#0B0C0E',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};

export const typography = {
  display: { fontSize: 28, fontWeight: '700', letterSpacing: -0.4 },
  h1: { fontSize: 22, fontWeight: '700', letterSpacing: -0.2 },
  h2: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400' },
  bodyMedium: { fontSize: 15, fontWeight: '600' },
  small: { fontSize: 13, fontWeight: '400' },
  small_medium: { fontSize: 13, fontWeight: '600' },
  tiny: { fontSize: 11, fontWeight: '500' },
};

export const shadow = {
  card: {
    shadowColor: '#0B0C0E',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
};

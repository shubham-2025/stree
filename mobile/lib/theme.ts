import { Appearance, type ColorSchemeName } from 'react-native';

import {
  BACKGROUND,
  BORDER,
  DARK_BACKGROUND,
  DARK_BORDER,
  DARK_PRIMARY,
  DARK_SURFACE,
  DARK_SECONDARY,
  DARK_TEXT,
  DARK_TEXT_LIGHT,
  ERROR,
  OVERLAY,
  PRIMARY,
  SECONDARY,
  SUCCESS,
  SURFACE,
  TEXT_DARK,
  TEXT_LIGHT,
} from '../constants/Colors';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  success: string;
  error: string;
  overlay: string;
}

export const colors: ThemeColors = {
  primary: PRIMARY,
  secondary: SECONDARY,
  background: BACKGROUND,
  surface: SURFACE,
  text: TEXT_DARK,
  textMuted: TEXT_LIGHT,
  border: BORDER,
  success: SUCCESS,
  error: ERROR,
  overlay: OVERLAY,
};

export const darkColors: ThemeColors = {
  primary: DARK_PRIMARY,
  secondary: DARK_SECONDARY,
  background: DARK_BACKGROUND,
  surface: DARK_SURFACE,
  text: DARK_TEXT,
  textMuted: DARK_TEXT_LIGHT,
  border: DARK_BORDER,
  success: SUCCESS,
  error: ERROR,
  overlay: 'rgba(0, 0, 0, 0.3)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 24,
    '2xl': 32,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 18,
    base: 24,
    relaxed: 28,
    display: 40,
  },
} as const;

export interface AppTheme {
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  isDark: boolean;
  colorScheme: 'light' | 'dark';
}

/**
 * Returns the active Stree theme for the given color scheme.
 */
export function getTheme(colorScheme?: ColorSchemeName): AppTheme {
  const resolvedScheme = colorScheme ?? Appearance.getColorScheme() ?? 'light';
  const isDark = resolvedScheme === 'dark';

  return {
    colors: isDark ? darkColors : colors,
    spacing,
    radius,
    typography,
    isDark,
    colorScheme: isDark ? 'dark' : 'light',
  };
}

export const lightTheme: AppTheme = {
  colors,
  spacing,
  radius,
  typography,
  isDark: false,
  colorScheme: 'light',
};

export const darkTheme: AppTheme = {
  colors: darkColors,
  spacing,
  radius,
  typography,
  isDark: true,
  colorScheme: 'dark',
};

export const PRIMARY = '#7B1E3A';
export const SECONDARY = '#C9A84C';
export const BACKGROUND = '#FAF7F2';
export const TEXT_DARK = '#2C2C2C';
export const TEXT_LIGHT = '#666666';
export const BORDER = '#E0E0E0';

export const SURFACE = '#FFFFFF';
export const SUCCESS = '#2E7D32';
export const ERROR = '#B42318';
export const OVERLAY = 'rgba(44, 44, 44, 0.08)';

export const DARK_BACKGROUND = '#161412';
export const DARK_SURFACE = '#221D1B';
export const DARK_TEXT = '#F6F0E8';
export const DARK_TEXT_LIGHT = '#CFC3B3';
export const DARK_BORDER = '#3B322E';
export const DARK_OVERLAY = 'rgba(0, 0, 0, 0.3)';

export const BRAND_COLORS = {
  primary: PRIMARY,
  secondary: SECONDARY,
  background: BACKGROUND,
  textDark: TEXT_DARK,
  textLight: TEXT_LIGHT,
  border: BORDER,
} as const;

export const LIGHT_COLORS = {
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
} as const;

export const DARK_COLORS = {
  primary: PRIMARY,
  secondary: SECONDARY,
  background: DARK_BACKGROUND,
  surface: DARK_SURFACE,
  text: DARK_TEXT,
  textMuted: DARK_TEXT_LIGHT,
  border: DARK_BORDER,
  success: SUCCESS,
  error: ERROR,
  overlay: DARK_OVERLAY,
} as const;

export type BrandColorKey = keyof typeof BRAND_COLORS;

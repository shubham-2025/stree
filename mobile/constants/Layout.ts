import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;
export const HORIZONTAL_PADDING = 16;
export const SECTION_SPACING = 24;
export const GRID_COLUMNS = 2;
export const GRID_GAP = 12;
export const CARD_RADIUS = 20;
export const IMAGE_ASPECT_RATIO = 0.72;
export const HEADER_HEIGHT = Platform.select({
  ios: 96,
  android: 84,
  default: 88,
});
export const TAB_BAR_HEIGHT = Platform.select({
  ios: 82,
  android: 68,
  default: 72,
});

export const PRODUCT_CARD_WIDTH =
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - GRID_GAP) / GRID_COLUMNS;

export const LAYOUT = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  horizontalPadding: HORIZONTAL_PADDING,
  sectionSpacing: SECTION_SPACING,
  gridColumns: GRID_COLUMNS,
  gridGap: GRID_GAP,
  productCardWidth: PRODUCT_CARD_WIDTH,
  cardRadius: CARD_RADIUS,
  imageAspectRatio: IMAGE_ASPECT_RATIO,
  headerHeight: HEADER_HEIGHT,
  tabBarHeight: TAB_BAR_HEIGHT,
} as const;

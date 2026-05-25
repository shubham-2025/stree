export const CATEGORIES = [
  'Silk',
  'Cotton',
  'Designer',
  'Bridal',
  'Seasonal',
] as const;

export const PRODUCT_FILTERS = [
  'All',
  'Silk',
  'Cotton',
  'Designer',
  'Bridal',
  'Sale',
] as const;

export type Category = (typeof CATEGORIES)[number];
export type ProductFilter = (typeof PRODUCT_FILTERS)[number];

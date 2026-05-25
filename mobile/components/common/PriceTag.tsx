import React from 'react';
import { Text, View, useColorScheme } from 'react-native';

import { getTheme } from '../../lib/theme';

export interface PriceTagProps {
  value: number;
  mrp?: number | null;
  size?: 'sm' | 'md' | 'lg';
  emphasize?: boolean;
  showDiscount?: boolean;
  className?: string;
}

const SIZE_STYLES = {
  sm: {
    price: 'text-[14px]',
    mrp: 'text-[12px]',
    discount: 'text-[11px]',
  },
  md: {
    price: 'text-[17px]',
    mrp: 'text-[13px]',
    discount: 'text-[12px]',
  },
  lg: {
    price: 'text-[22px]',
    mrp: 'text-[15px]',
    discount: 'text-[13px]',
  },
} as const;

/**
 * Formats an INR amount for display in the Stree mobile app.
 */
export function formatPrice(value: number): string {
  const normalizedValue = Number.isFinite(value) ? value : 0;
  const hasDecimals = normalizedValue % 1 !== 0;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(normalizedValue);
}

function getDiscountPercent(price: number, mrp?: number | null): number {
  if (!mrp || mrp <= price || mrp <= 0) {
    return 0;
  }

  return Math.round(((mrp - price) / mrp) * 100);
}

/**
 * Renders a branded INR price block with optional MRP and discount display.
 */
export function PriceTag({
  value,
  mrp,
  size = 'md',
  emphasize = false,
  showDiscount = true,
  className,
}: PriceTagProps): React.JSX.Element {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const styles = SIZE_STYLES[size];
  const discountPercent = getDiscountPercent(value, mrp);

  return (
    <View className={['flex-row items-center flex-wrap gap-x-2 gap-y-1', className].filter(Boolean).join(' ')}>
      <Text
        className={[
          styles.price,
          emphasize ? 'font-bold' : 'font-semibold',
        ].join(' ')}
        style={{ color: theme.colors.primary }}
      >
        {formatPrice(value)}
      </Text>

      {mrp && mrp > value ? (
        <Text
          className={[styles.mrp, 'font-medium line-through'].join(' ')}
          style={{ color: theme.colors.textMuted }}
        >
          {formatPrice(mrp)}
        </Text>
      ) : null}

      {showDiscount && discountPercent > 0 ? (
        <Text
          className={[styles.discount, 'font-semibold'].join(' ')}
          style={{ color: theme.colors.success }}
        >
          {discountPercent}% off
        </Text>
      ) : null}
    </View>
  );
}

export default PriceTag;

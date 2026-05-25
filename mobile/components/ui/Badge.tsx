import React from 'react';
import { Text, View, useColorScheme } from 'react-native';

import { getTheme } from '../../lib/theme';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'outline' | 'sale';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  className?: string;
}

interface BadgePalette {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

const SIZE_CLASSES: Record<BadgeSize, { container: string; text: string }> = {
  sm: {
    container: 'px-2.5 py-1',
    text: 'text-[11px]',
  },
  md: {
    container: 'px-3 py-1.5',
    text: 'text-[12px]',
  },
};

function withOpacity(hexColor: string, opacity: number): string {
  const normalized = hexColor.replace('#', '');

  if (normalized.length !== 6) {
    return hexColor;
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

function getBadgePalette(
  variant: BadgeVariant,
  primary: string,
  secondary: string,
  success: string,
  error: string,
  text: string,
  border: string
): BadgePalette {
  switch (variant) {
    case 'secondary':
      return {
        backgroundColor: withOpacity(secondary, 0.2),
        borderColor: 'transparent',
        textColor: secondary,
      };
    case 'success':
      return {
        backgroundColor: withOpacity(success, 0.14),
        borderColor: 'transparent',
        textColor: success,
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderColor: border,
        textColor: text,
      };
    case 'sale':
      return {
        backgroundColor: withOpacity(error, 0.14),
        borderColor: 'transparent',
        textColor: error,
      };
    case 'primary':
    default:
      return {
        backgroundColor: withOpacity(primary, 0.12),
        borderColor: 'transparent',
        textColor: primary,
      };
  }
}

/**
 * Renders a compact status badge for product metadata such as fabric, COD, or sale state.
 */
export function Badge({
  text,
  variant = 'primary',
  size = 'sm',
  icon,
  className,
}: BadgeProps): React.JSX.Element {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const palette = getBadgePalette(
    variant,
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.success,
    theme.colors.error,
    theme.colors.text,
    theme.colors.border
  );
  const sizeStyles = SIZE_CLASSES[size];

  return (
    <View
      className={[
        'self-start rounded-full border flex-row items-center gap-1.5',
        sizeStyles.container,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        backgroundColor: palette.backgroundColor,
        borderColor: palette.borderColor,
        borderWidth: variant === 'outline' ? 1 : 0,
      }}
    >
      {icon ? <View style={{ pointerEvents: 'none' }}>{icon}</View> : null}
      <Text
        className={['font-medium tracking-[0.4px]', sizeStyles.text].join(' ')}
        style={{ color: palette.textColor }}
      >
        {text}
      </Text>
    </View>
  );
}

export default Badge;

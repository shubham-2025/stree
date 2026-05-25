import React from 'react';
import { Pressable, Text, useColorScheme } from 'react-native';

import { getTheme } from '../../lib/theme';

export interface CategoryChipProps {
  label: string;
  active?: boolean;
  count?: number;
  onPress?: () => void;
  className?: string;
}

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

/**
 * Renders a tappable category filter pill with an active visual state.
 */
export function CategoryChip({
  label,
  active = false,
  count,
  onPress,
  className,
}: CategoryChipProps): React.JSX.Element {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      android_ripple={{ color: withOpacity(theme.colors.primary, active ? 0.18 : 0.08) }}
      className={[
        'overflow-hidden rounded-[16px] border px-4 py-3',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: active
          ? theme.colors.secondary
          : theme.isDark
            ? withOpacity(theme.colors.surface, 0.9)
            : theme.colors.surface,
        borderColor: active ? theme.colors.secondary : theme.colors.border,
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <Text
        className="text-[13px] font-semibold"
        style={{ color: active ? '#2C2C2C' : theme.colors.text }}
      >
        {label}
        {typeof count === 'number' ? ` (${count})` : ''}
      </Text>
    </Pressable>
  );
}

export default CategoryChip;

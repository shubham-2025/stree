import React from 'react';
import { Pressable, Text, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { getTheme } from '../../lib/theme';
import { Card } from '../ui/Card';

export interface EmptyStateProps {
  title: string;
  message: string;
  ctaLabel?: string;
  onPressCta?: () => void;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
  fullScreen?: boolean;
  secondaryLabel?: string;
  onPressSecondary?: () => void;
  className?: string;
}

/**
 * Renders a polished empty state with optional primary and secondary actions.
 */
export function EmptyState({
  title,
  message,
  ctaLabel,
  onPressCta,
  iconName = 'bag-handle-outline',
  fullScreen = false,
  secondaryLabel,
  onPressSecondary,
  className,
}: EmptyStateProps): React.JSX.Element {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);

  return (
    <View
      className={[
        'items-center justify-center px-6 py-8',
        fullScreen ? 'flex-1' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Card className="w-full max-w-[420px] items-center rounded-[28px] px-6 py-8" elevated padding="none">
        <View
          className="h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: `${theme.colors.primary}14` }}
        >
          <Ionicons color={theme.colors.primary} name={iconName} size={34} />
        </View>

        <Text
          className="mt-5 text-center text-[24px] font-semibold leading-8"
          style={{ color: theme.colors.text }}
        >
          {title}
        </Text>

        <Text
          className="mt-3 text-center text-[15px] leading-7"
          style={{ color: theme.colors.textMuted }}
        >
          {message}
        </Text>

        {ctaLabel ? (
          <Pressable
            accessibilityRole="button"
            className="mt-6 min-h-[54px] w-full items-center justify-center rounded-[18px] px-5 py-4"
            onPress={onPressCta}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#65182F' : theme.colors.primary,
              borderColor: theme.colors.primary,
              borderWidth: 1,
              opacity: onPressCta ? 1 : 0.96,
            })}
          >
            <Text className="text-[16px] font-semibold" style={{ color: '#FFFFFF' }}>
              {ctaLabel}
            </Text>
          </Pressable>
        ) : null}

        {secondaryLabel ? (
          <Pressable
            accessibilityRole="button"
            className="mt-3 min-h-[54px] w-full items-center justify-center rounded-[18px] px-5 py-4"
            onPress={onPressSecondary}
            style={({ pressed }) => ({
              backgroundColor: pressed ? `${theme.colors.primary}10` : 'transparent',
              borderColor: theme.colors.border,
              borderWidth: 1,
            })}
          >
            <Text className="text-[15px] font-semibold" style={{ color: theme.colors.text }}>
              {secondaryLabel}
            </Text>
          </Pressable>
        ) : null}
      </Card>
    </View>
  );
}

export default EmptyState;

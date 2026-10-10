import React from 'react';
import { Text, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { getTheme } from '../../lib/theme';
import { Card } from '../ui/Card';
import Button from '../ui/Button';

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

        {ctaLabel || secondaryLabel ? (
          <View className="mt-6 w-full">
            {ctaLabel ? (
              <Button
                onPress={onPressCta}
                size="lg"
                style={{
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                }}
                text={ctaLabel}
              />
            ) : null}

            {secondaryLabel ? (
              <Button
                className={ctaLabel ? 'mt-3' : undefined}
                onPress={onPressSecondary}
                size="md"
                style={{
                  backgroundColor: theme.isDark ? `${theme.colors.primary}12` : 'transparent',
                  borderColor: theme.colors.primary,
                }}
                text={secondaryLabel}
                variant="outline"
              />
            ) : null}
          </View>
        ) : null}
      </Card>
    </View>
  );
}

export default EmptyState;

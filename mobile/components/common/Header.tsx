import React from 'react';
import { Pressable, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { getTheme } from '../../lib/theme';
import BrandMark from './BrandMark';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  cartCount?: number;
  showBackButton?: boolean;
  showCartButton?: boolean;
  showProfileButton?: boolean;
  onPressBack?: () => void;
  onPressCart?: () => void;
  onPressProfile?: () => void;
  rightSlot?: React.ReactNode;
  className?: string;
}

/**
 * Renders the Stree mobile top bar with optional back navigation and cart access.
 */
export function Header({
  title,
  subtitle,
  showLogo = false,
  cartCount = 0,
  showBackButton = false,
  showCartButton = false,
  showProfileButton = false,
  onPressBack,
  onPressCart,
  onPressProfile,
  rightSlot,
  className,
}: HeaderProps): React.JSX.Element {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const resolvedTitle = title ?? (showLogo ? 'Handpicked Sarees' : 'Stree Sarees');
  const resolvedSubtitle = subtitle ?? 'Stree';
  const actionButtonStyle = ({ pressed }: { pressed: boolean }) => ({
    backgroundColor: pressed
      ? theme.isDark
        ? 'rgba(63, 53, 48, 0.98)'
        : 'rgba(123, 30, 58, 0.08)'
      : theme.isDark
        ? 'rgba(34, 29, 27, 0.96)'
        : 'rgba(255, 255, 255, 0.96)',
    borderColor: theme.colors.border,
  });

  return (
    <SafeAreaView
      className={['px-4 pb-3 pt-2', className].filter(Boolean).join(' ')}
      edges={['top']}
      style={{ backgroundColor: theme.colors.background }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 flex-row items-start gap-3">
          <BrandMark size={52} />

          <View className="flex-1 pt-1">
            <Text
              className="text-[11px] font-semibold uppercase"
              style={{ color: theme.colors.textMuted, letterSpacing: 0.9 }}
            >
              {resolvedSubtitle}
            </Text>
            <Text
              className="mt-1 text-[18px] font-semibold leading-6"
              numberOfLines={2}
              style={{ color: theme.colors.text }}
            >
              {resolvedTitle}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          {showBackButton ? (
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              android_ripple={{ color: 'rgba(123, 30, 58, 0.10)', radius: 22 }}
              className="h-11 w-11 items-center justify-center rounded-[16px] border"
              onPress={onPressBack ?? (() => router.back())}
              style={actionButtonStyle}
            >
              <Ionicons color={theme.colors.text} name="chevron-back" size={20} />
            </Pressable>
          ) : null}
          {rightSlot ? (
            rightSlot
          ) : showProfileButton ? (
            <Pressable
              accessibilityLabel="Open profile"
              accessibilityRole="button"
              android_ripple={{ color: 'rgba(123, 30, 58, 0.10)', radius: 22 }}
              className="h-11 w-11 items-center justify-center rounded-[16px] border"
              onPress={onPressProfile ?? (() => router.push('/profile'))}
              style={actionButtonStyle}
            >
              <Ionicons color={theme.colors.text} name="person-outline" size={20} />
            </Pressable>
          ) : showCartButton ? (
            <Pressable
              accessibilityLabel="Open cart"
              accessibilityRole="button"
              android_ripple={{ color: 'rgba(123, 30, 58, 0.10)', radius: 22 }}
              className="h-11 w-11 items-center justify-center rounded-[16px] border"
              onPress={onPressCart ?? (() => router.push('/cart'))}
              style={actionButtonStyle}
            >
              <Ionicons color={theme.colors.text} name="bag-handle-outline" size={20} />
              {cartCount > 0 ? (
                <View
                  className="absolute -right-1 -top-1 min-h-[18px] min-w-[18px] items-center justify-center rounded-full px-1"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  <Text className="text-[10px] font-bold text-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

export default Header;

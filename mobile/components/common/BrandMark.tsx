import React from 'react';
import { Image, Pressable, View, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

import { getTheme } from '../../lib/theme';

const BRAND_LOGO = require('../../assets/images/stree-navbar-logo.png');

export interface BrandMarkProps {
  size?: number;
  rounded?: boolean;
  framed?: boolean;
  onPress?: () => void;
  className?: string;
}

/**
 * Renders the Stree brand mark used across headers and loading states.
 */
export function BrandMark({
  size = 40,
  rounded = true,
  framed = false,
  onPress,
  className,
}: BrandMarkProps): React.JSX.Element {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const handlePress = onPress ?? (() => router.replace('/'));

  return (
    <Pressable
      accessibilityLabel="Go to home"
      accessibilityRole="button"
      className={className}
      onPress={handlePress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View
        className={rounded ? 'items-center justify-center rounded-[16px]' : 'items-center justify-center'}
        style={{
          width: size,
          height: size,
          backgroundColor: framed
            ? theme.isDark
              ? 'rgba(255, 255, 255, 0.92)'
              : 'rgba(255, 255, 255, 0.96)'
            : 'transparent',
          borderColor: framed ? theme.colors.border : 'transparent',
          borderWidth: framed ? 1 : 0,
        }}
      >
        <Image
          source={BRAND_LOGO}
          style={{
            width: framed ? size - 12 : size,
            height: framed ? size - 12 : size,
            resizeMode: 'contain',
          }}
        />
      </View>
    </Pressable>
  );
}

export default BrandMark;

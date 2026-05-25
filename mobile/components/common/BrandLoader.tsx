import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Text,
  View,
  useColorScheme,
} from 'react-native';

import { getTheme } from '../../lib/theme';
import BrandMark from './BrandMark';

export interface BrandLoaderProps {
  label?: string;
  caption?: string;
  fullScreen?: boolean;
  size?: number;
}

/**
 * Renders a branded loading state using the Stree logo instead of a generic spinner.
 */
export function BrandLoader({
  label = 'Loading Stree',
  caption,
  fullScreen = false,
  size = 56,
}: BrandLoaderProps): React.JSX.Element {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.04,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.96,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [scale]);

  return (
    <View
      className={[
        'items-center justify-center px-6 py-8',
        fullScreen ? 'flex-1' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <BrandMark className="pointer-events-none" onPress={() => undefined} size={size} />
      </Animated.View>
      <Text className="mt-4 text-[16px] font-semibold" style={{ color: theme.colors.text }}>
        {label}
      </Text>
      {caption ? (
        <Text
          className="mt-2 text-center text-[13px] leading-6"
          style={{ color: theme.colors.textMuted }}
        >
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

export default BrandLoader;

import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  View,
  type StyleProp,
  type ViewStyle,
  useColorScheme,
} from 'react-native';

import { getTheme } from '../../lib/theme';

export type LoadingSkeletonVariant = 'grid' | 'list' | 'banner' | 'text' | 'cart';

export interface LoadingSkeletonProps {
  variant?: LoadingSkeletonVariant;
  count?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
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

function renderGridSkeleton(baseColor: string, pulseStyle: { opacity: Animated.Value }) {
  return (
    <View className="gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Animated.View
          key={`grid-${index}`}
          className="overflow-hidden rounded-[22px] border p-3"
          style={[
            {
              backgroundColor: baseColor,
              borderColor: 'transparent',
              opacity: pulseStyle.opacity,
            },
          ]}
        >
          <View className="flex-row gap-4">
            <View className="h-[136px] w-[108px] rounded-[18px]" style={{ backgroundColor: '#FFFFFF20' }} />
            <View className="flex-1 justify-between py-1">
              <View>
                <View className="h-4 w-4/5 rounded-full" style={{ backgroundColor: '#FFFFFF30' }} />
                <View className="mt-2 h-3 w-3/5 rounded-full" style={{ backgroundColor: '#FFFFFF25' }} />
                <View className="mt-3 h-3 w-full rounded-full" style={{ backgroundColor: '#FFFFFF20' }} />
                <View className="mt-2 h-3 w-5/6 rounded-full" style={{ backgroundColor: '#FFFFFF20' }} />
              </View>
              <View>
                <View className="h-3 w-1/2 rounded-full" style={{ backgroundColor: '#FFFFFF30' }} />
                <View className="mt-3 h-4 w-2/5 rounded-full" style={{ backgroundColor: '#FFFFFF35' }} />
              </View>
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

function renderListSkeleton(baseColor: string, pulseStyle: { opacity: Animated.Value }, count: number) {
  return (
    <View className="gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <Animated.View
          key={`list-${index}`}
          className="rounded-[20px] border p-4"
          style={{
            backgroundColor: baseColor,
            borderColor: 'transparent',
            opacity: pulseStyle.opacity,
          }}
        >
          <View className="flex-row gap-4">
            <View className="h-[92px] w-[72px] rounded-[16px]" style={{ backgroundColor: '#FFFFFF20' }} />
            <View className="flex-1 gap-2">
              <View className="h-4 w-4/5 rounded-full" style={{ backgroundColor: '#FFFFFF30' }} />
              <View className="h-3 w-2/5 rounded-full" style={{ backgroundColor: '#FFFFFF25' }} />
              <View className="mt-2 h-4 w-1/3 rounded-full" style={{ backgroundColor: '#FFFFFF35' }} />
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

function renderBannerSkeleton(baseColor: string, pulseStyle: { opacity: Animated.Value }) {
  return (
    <Animated.View
      className="overflow-hidden rounded-[28px] p-6"
      style={{
        backgroundColor: baseColor,
        opacity: pulseStyle.opacity,
      }}
    >
      <View className="h-[220px] rounded-[22px]" style={{ backgroundColor: '#FFFFFF20' }} />
      <View className="mt-4 h-6 w-2/3 rounded-full" style={{ backgroundColor: '#FFFFFF35' }} />
      <View className="mt-3 h-4 w-1/2 rounded-full" style={{ backgroundColor: '#FFFFFF25' }} />
      <View className="mt-5 h-12 w-40 rounded-full" style={{ backgroundColor: '#FFFFFF30' }} />
    </Animated.View>
  );
}

function renderTextSkeleton(baseColor: string, pulseStyle: { opacity: Animated.Value }, count: number) {
  return (
    <View className="gap-2">
      {Array.from({ length: count }).map((_, index) => (
        <Animated.View
          key={`text-${index}`}
          className={index === count - 1 ? 'h-3 w-2/3 rounded-full' : 'h-3 w-full rounded-full'}
          style={{
            backgroundColor: baseColor,
            opacity: pulseStyle.opacity,
          }}
        />
      ))}
    </View>
  );
}

function renderCartSkeleton(baseColor: string, pulseStyle: { opacity: Animated.Value }, count: number) {
  return (
    <View className="gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <Animated.View
          key={`cart-${index}`}
          className="rounded-[22px] border p-4"
          style={{
            backgroundColor: baseColor,
            borderColor: 'transparent',
            opacity: pulseStyle.opacity,
          }}
        >
          <View className="flex-row items-center gap-4">
            <View className="h-[92px] w-[72px] rounded-[16px]" style={{ backgroundColor: '#FFFFFF20' }} />
            <View className="flex-1 gap-2">
              <View className="h-4 w-4/5 rounded-full" style={{ backgroundColor: '#FFFFFF35' }} />
              <View className="h-3 w-1/2 rounded-full" style={{ backgroundColor: '#FFFFFF25' }} />
              <View className="mt-2 flex-row items-center justify-between">
                <View className="h-4 w-1/4 rounded-full" style={{ backgroundColor: '#FFFFFF35' }} />
                <View className="h-10 w-28 rounded-full" style={{ backgroundColor: '#FFFFFF25' }} />
              </View>
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

/**
 * Renders animated skeleton placeholders for loading states across the app.
 */
export function LoadingSkeleton({
  variant = 'grid',
  count = 3,
  className,
  style,
}: LoadingSkeletonProps): React.JSX.Element {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const opacity = useRef(new Animated.Value(0.55)).current;
  const baseColor = useMemo(
    () => withOpacity(theme.colors.border, theme.isDark ? 0.55 : 0.9),
    [theme.colors.border, theme.isDark]
  );
  const shouldUseNativeDriver = Platform.OS !== 'web';

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: shouldUseNativeDriver,
        }),
        Animated.timing(opacity, {
          toValue: 0.55,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: shouldUseNativeDriver,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity, shouldUseNativeDriver]);

  const pulseStyle = { opacity };

  return (
    <View className={className} style={style}>
      {variant === 'banner' ? renderBannerSkeleton(baseColor, pulseStyle) : null}
      {variant === 'grid' ? renderGridSkeleton(baseColor, pulseStyle) : null}
      {variant === 'list' ? renderListSkeleton(baseColor, pulseStyle, count) : null}
      {variant === 'text' ? renderTextSkeleton(baseColor, pulseStyle, count) : null}
      {variant === 'cart' ? renderCartSkeleton(baseColor, pulseStyle, count) : null}
    </View>
  );
}

export default LoadingSkeleton;

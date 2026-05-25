import React, { useState } from 'react';
import {
  Image,
  Pressable,
  Text,
  View,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  useColorScheme,
} from 'react-native';

import { getTheme } from '../../lib/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  text: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  textClassName?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: ((event: GestureResponderEvent) => void) | null;
}

interface ButtonPalette {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  pressedBackgroundColor: string;
}

const SIZE_STYLES: Record<
  ButtonSize,
  { container: string; text: string; indicator: 'small' | 'large' }
> = {
  sm: {
    container: 'min-h-[44px] px-4 py-3',
    text: 'text-[14px]',
    indicator: 'small',
  },
  md: {
    container: 'min-h-[52px] px-5 py-4',
    text: 'text-[16px]',
    indicator: 'small',
  },
  lg: {
    container: 'min-h-[58px] px-6 py-[18px]',
    text: 'text-[17px]',
    indicator: 'small',
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

function blendHexColors(baseColor: string, mixColor: string, amount: number): string {
  const normalize = (value: string): [number, number, number] | null => {
    const normalized = value.replace('#', '');

    if (normalized.length !== 6) {
      return null;
    }

    return [
      Number.parseInt(normalized.slice(0, 2), 16),
      Number.parseInt(normalized.slice(2, 4), 16),
      Number.parseInt(normalized.slice(4, 6), 16),
    ];
  };

  const base = normalize(baseColor);
  const mix = normalize(mixColor);

  if (!base || !mix) {
    return baseColor;
  }

  const blendChannel = (baseChannel: number, mixChannel: number): number =>
    Math.round(baseChannel + (mixChannel - baseChannel) * amount);

  const [red, green, blue] = [
    blendChannel(base[0], mix[0]),
    blendChannel(base[1], mix[1]),
    blendChannel(base[2], mix[2]),
  ];

  return `rgb(${red}, ${green}, ${blue})`;
}

function getButtonPalette(
  variant: ButtonVariant,
  isDark: boolean,
  primary: string,
  secondary: string,
  success: string,
  text: string,
  border: string
): ButtonPalette {
  switch (variant) {
    case 'secondary':
      return {
        backgroundColor: secondary,
        borderColor: secondary,
        textColor: '#2C2C2C',
        pressedBackgroundColor: blendHexColors(secondary, '#2C2C2C', 0.12),
      };
    case 'success':
      return {
        backgroundColor: success,
        borderColor: success,
        textColor: '#FFFFFF',
        pressedBackgroundColor: blendHexColors(success, '#1B5E20', 0.3),
      };
    case 'outline':
      return {
        backgroundColor: isDark ? withOpacity(primary, 0.08) : 'transparent',
        borderColor: primary,
        textColor: primary,
        pressedBackgroundColor: withOpacity(primary, isDark ? 0.2 : 0.12),
      };
    case 'ghost':
      return {
        backgroundColor: isDark ? withOpacity(border, 0.18) : withOpacity(primary, 0.08),
        borderColor: 'transparent',
        textColor: text,
        pressedBackgroundColor: isDark ? withOpacity(border, 0.26) : withOpacity(primary, 0.14),
      };
    case 'primary':
    default:
      return {
        backgroundColor: primary,
        borderColor: primary,
        textColor: '#FFFFFF',
        pressedBackgroundColor: blendHexColors(primary, '#2C2C2C', 0.12),
      };
  }
}

/**
 * Renders the primary action button used throughout the Stree mobile app.
 */
export function Button({
  text,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  leftIcon,
  rightIcon,
  className,
  textClassName,
  style,
  onPress,
  onPressIn,
  onPressOut,
  ...pressableProps
}: ButtonProps): React.JSX.Element {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const [pressed, setPressed] = useState<boolean>(false);
  const palette = getButtonPalette(
    variant,
    theme.isDark,
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.success,
    theme.colors.text,
    theme.colors.border
  );
  const isDisabled = disabled || loading;
  const sizeStyles = SIZE_STYLES[size];
  const containerClassName = [
    'flex-row items-center justify-center overflow-hidden rounded-[18px] border',
    sizeStyles.container,
    fullWidth ? 'w-full' : 'self-start',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const labelClassName = [
    'font-semibold tracking-[0.3px]',
    sizeStyles.text,
    textClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      android_ripple={{ color: withOpacity(palette.textColor, variant === 'primary' ? 0.16 : 0.08) }}
      className={containerClassName}
      disabled={isDisabled}
      onPress={onPress ?? undefined}
      onPressIn={(event) => {
        setPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        onPressOut?.(event);
      }}
      style={[
        {
          backgroundColor:
            pressed && !isDisabled ? palette.pressedBackgroundColor : palette.backgroundColor,
          borderColor: palette.borderColor,
          borderWidth: variant === 'ghost' ? 0 : 1,
          opacity: isDisabled ? 0.55 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.988 : 1 }],
        },
        style,
      ]}
      {...pressableProps}
    >
      <View className="flex-row items-center justify-center gap-2.5">
        {loading ? (
          <View
            className="items-center justify-center rounded-[12px] p-1"
            style={{
              backgroundColor: theme.isDark ? withOpacity(theme.colors.surface, 0.72) : 'rgba(255, 255, 255, 0.2)',
            }}
          >
            <Image
              source={require('../../assets/images/stree-navbar-logo.png')}
              style={{
                width: size === 'sm' ? 18 : 20,
                height: size === 'sm' ? 18 : 20,
                resizeMode: 'contain',
              }}
            />
          </View>
        ) : (
          <>
            {leftIcon ? <View style={{ pointerEvents: 'none' }}>{leftIcon}</View> : null}
            <Text className={labelClassName} style={{ color: palette.textColor }}>
              {text}
            </Text>
            {rightIcon ? <View style={{ pointerEvents: 'none' }}>{rightIcon}</View> : null}
          </>
        )}
      </View>
    </Pressable>
  );
}

export default Button;

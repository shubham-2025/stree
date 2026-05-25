import React, { forwardRef, useState } from 'react';
import {
  Platform,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
  useColorScheme,
} from 'react-native';

import { getTheme } from '../../lib/theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  inputClassName?: string;
  inputStyle?: StyleProp<TextStyle>;
  wrapperStyle?: StyleProp<ViewStyle>;
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
 * Renders a themed text input with label, helper text, and validation messaging.
 */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    error,
    hint,
    required = false,
    leftIcon,
    rightIcon,
    containerClassName,
    inputClassName,
    inputStyle,
    wrapperStyle,
    editable = true,
    multiline = false,
    onFocus,
    onBlur,
    placeholderTextColor,
    ...textInputProps
  },
  ref
): React.JSX.Element {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const hasError = Boolean(error);
  const helperText = hasError ? error : hint;
  const borderColor = hasError
    ? theme.colors.error
    : isFocused
      ? theme.colors.primary
      : theme.colors.border;
  const backgroundColor = editable
    ? theme.colors.surface
    : withOpacity(theme.colors.border, theme.isDark ? 0.18 : 0.3);
  const labelColor = hasError ? theme.colors.error : theme.colors.text;
  const focusStyle =
    Platform.OS === 'web'
      ? ({
          boxShadow: isFocused
            ? `0px 6px 12px ${withOpacity(theme.colors.primary, 0.16)}`
            : `0px 6px 8px ${withOpacity('#000000', 0.04)}`,
        } as ViewStyle)
      : ({
          shadowColor: isFocused ? theme.colors.primary : '#000000',
          shadowOpacity: isFocused ? 0.14 : 0.04,
          shadowRadius: isFocused ? 12 : 8,
          shadowOffset: { width: 0, height: 6 },
          elevation: isFocused ? 2 : 0,
        } as ViewStyle);

  return (
    <View className={['gap-2', containerClassName].filter(Boolean).join(' ')}>
      {label ? (
        <Text
          className="text-[14px] font-medium tracking-[0.2px]"
          style={{ color: labelColor }}
        >
          {label}
          {required ? (
            <Text style={{ color: theme.colors.error }}>{' *'}</Text>
          ) : null}
        </Text>
      ) : null}

      <View
        className="min-h-[54px] flex-row items-center rounded-[18px] border px-4"
        style={[
          {
            backgroundColor,
            borderColor,
          },
          focusStyle,
          multiline ? { alignItems: 'flex-start', paddingTop: 14, paddingBottom: 14 } : null,
          wrapperStyle,
        ]}
      >
        {leftIcon ? <View className="mr-3 pt-0.5">{leftIcon}</View> : null}

        <TextInput
          ref={ref}
          className={[
            'flex-1 text-[16px] leading-6',
            multiline ? 'min-h-[96px]' : '',
            inputClassName,
          ]
            .filter(Boolean)
            .join(' ')}
          editable={editable}
          multiline={multiline}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          placeholderTextColor={placeholderTextColor ?? theme.colors.textMuted}
          selectionColor={theme.colors.primary}
          style={[
            {
              color: theme.colors.text,
              textAlignVertical: multiline ? 'top' : 'center',
            },
            inputStyle,
          ]}
          {...textInputProps}
        />

        {rightIcon ? <View className="ml-3 pt-0.5">{rightIcon}</View> : null}
      </View>

      {helperText ? (
        <Text
          className="text-[12px] leading-5"
          style={{ color: hasError ? theme.colors.error : theme.colors.textMuted }}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
});

export default Input;

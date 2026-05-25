import React from 'react';
import {
  Platform,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
  useColorScheme,
} from 'react-native';

import { getTheme } from '../../lib/theme';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends Omit<ViewProps, 'style'> {
  children: React.ReactNode;
  padding?: CardPadding;
  bordered?: boolean;
  elevated?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

const PADDING_CLASSES: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

/**
 * Renders a reusable luxury-style card container for content sections and list items.
 */
export function Card({
  children,
  padding = 'md',
  bordered = true,
  elevated = true,
  className,
  style,
  ...viewProps
}: CardProps): React.JSX.Element {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const shadowStyle: ViewStyle = elevated
    ? Platform.select<ViewStyle>({
        android: {
          elevation: 3,
        },
        default: Platform.OS === 'web'
          ? ({
              boxShadow: theme.isDark
                ? '0px 10px 18px rgba(0, 0, 0, 0.2)'
                : '0px 10px 18px rgba(44, 44, 44, 0.08)',
            } as ViewStyle)
          : {
              shadowColor: theme.isDark ? '#000000' : '#2C2C2C',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: theme.isDark ? 0.2 : 0.08,
              shadowRadius: 18,
            },
      }) ?? {}
    : {};

  return (
    <View
      className={['rounded-[20px]', PADDING_CLASSES[padding], className].filter(Boolean).join(' ')}
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderColor: bordered ? theme.colors.border : 'transparent',
          borderWidth: bordered ? 1 : 0,
        },
        shadowStyle,
        style,
      ]}
      {...viewProps}
    >
      {children}
    </View>
  );
}

export default Card;

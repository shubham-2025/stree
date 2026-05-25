import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getTheme } from '../lib/theme';

type ToastTone = 'primary' | 'success' | 'accent';

export interface ToastOptions {
  title: string;
  message?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  tone?: ToastTone;
  durationMs?: number;
}

interface ActiveToast extends ToastOptions {
  id: number;
}

export interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLES: Record<
  ToastTone,
  { accent: string; iconBackground: string; iconColor: string }
> = {
  primary: {
    accent: '#7B1E3A',
    iconBackground: 'rgba(123, 30, 58, 0.12)',
    iconColor: '#7B1E3A',
  },
  success: {
    accent: '#2E7D32',
    iconBackground: 'rgba(46, 125, 50, 0.14)',
    iconColor: '#2E7D32',
  },
  accent: {
    accent: '#C9A84C',
    iconBackground: 'rgba(201, 168, 76, 0.2)',
    iconColor: '#8A6517',
  },
};

export interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Provides a compact app-wide toast system for quick action feedback.
 */
export function ToastProvider({ children }: ToastProviderProps): React.JSX.Element {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ActiveToast | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastIdRef = useRef<number>(0);

  const clearHideTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const hideToast = useCallback(() => {
    clearHideTimeout();

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 18,
        duration: 180,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setToast(null);
      }
    });
  }, [clearHideTimeout, opacity, translateY]);

  const showToast = useCallback(
    ({
      durationMs = 2200,
      iconName = 'sparkles-outline',
      message,
      title,
      tone = 'accent',
    }: ToastOptions) => {
      clearHideTimeout();
      toastIdRef.current += 1;
      setToast({
        id: toastIdRef.current,
        title,
        message,
        iconName,
        tone,
        durationMs,
      });

      opacity.stopAnimation();
      translateY.stopAnimation();
      opacity.setValue(0);
      translateY.setValue(24);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 16,
          mass: 0.8,
          stiffness: 180,
          useNativeDriver: true,
        }),
      ]).start();

      timeoutRef.current = setTimeout(() => {
        hideToast();
      }, durationMs);
    },
    [clearHideTimeout, hideToast, opacity, translateY]
  );

  useEffect(
    () => () => {
      clearHideTimeout();
    },
    [clearHideTimeout]
  );

  const contextValue = useMemo<ToastContextValue>(
    () => ({
      showToast,
    }),
    [showToast]
  );

  const toneStyle = toast ? TONE_STYLES[toast.tone ?? 'accent'] : null;

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <View
        pointerEvents="box-none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            justifyContent: 'flex-end',
            paddingHorizontal: 16,
            paddingBottom: Math.max(insets.bottom, 16) + 78,
            zIndex: 999,
            elevation: 999,
          },
        ]}
      >
        {toast && toneStyle ? (
          <Animated.View
            pointerEvents="none"
            style={{
              opacity,
              transform: [{ translateY }],
              alignSelf: 'stretch',
            }}
          >
            <View
              className="overflow-hidden rounded-[24px] border px-4 py-3"
              style={{
                backgroundColor: theme.isDark
                  ? 'rgba(34, 29, 27, 0.98)'
                  : 'rgba(255, 255, 255, 0.98)',
                borderColor: theme.colors.border,
                shadowColor: theme.isDark ? '#000000' : '#2C2C2C',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: theme.isDark ? 0.28 : 0.12,
                shadowRadius: 18,
                elevation: 8,
              }}
            >
              <View
                className="absolute inset-y-0 left-0 w-1.5"
                style={{ backgroundColor: toneStyle.accent }}
              />
              <View className="flex-row items-center gap-3 pl-2">
                <View
                  className="h-12 w-12 items-center justify-center rounded-[16px]"
                  style={{ backgroundColor: toneStyle.iconBackground }}
                >
                  <Ionicons
                    color={toneStyle.iconColor}
                    name={toast.iconName ?? 'sparkles-outline'}
                    size={22}
                  />
                </View>

                <View className="flex-1">
                  <Text
                    className="text-[15px] font-semibold"
                    style={{ color: theme.colors.text }}
                  >
                    {toast.title}
                  </Text>
                  {toast.message ? (
                    <Text
                      className="mt-1 text-[13px] leading-5"
                      style={{ color: theme.colors.textMuted }}
                    >
                      {toast.message}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          </Animated.View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

/**
 * Returns the active toast context.
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider.');
  }

  return context;
}

export default ToastProvider;

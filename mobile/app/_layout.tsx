import 'react-native-gesture-handler';
import '../global.css';

import React, { useEffect, useMemo, useState } from 'react';
import { DeviceEventEmitter, View } from 'react-native';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppErrorBoundary from './_error';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { WishlistProvider } from '../contexts/WishlistContext';
import { ToastProvider } from '../contexts/ToastContext';
import { ThemePreferenceProvider } from '../contexts/ThemePreferenceContext';
import BrandLoader from '../components/common/BrandLoader';
import { useAuth } from '../hooks/useAuth';
import { useThemePreference } from '../hooks/useThemePreference';
import { AUTH_INTRO_SEEN_EVENT } from '../lib/auth-intro';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../lib/storage';
import { getTheme } from '../lib/theme';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

interface AppProvidersProps {
  children: React.ReactNode;
}

function createNavigationTheme(
  isDark: boolean,
  backgroundColor: string,
  cardColor: string,
  textColor: string,
  borderColor: string,
  primaryColor: string
) {
  const baseTheme = isDark ? DarkTheme : DefaultTheme;

  return {
    ...baseTheme,
    dark: isDark,
    colors: {
      ...baseTheme.colors,
      background: backgroundColor,
      card: cardColor,
      text: textColor,
      border: borderColor,
      primary: primaryColor,
      notification: primaryColor,
    },
  };
}

function AppProviders({ children }: AppProvidersProps): React.JSX.Element {
  return (
    <ThemePreferenceProvider>
      <ToastProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>{children}</CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemePreferenceProvider>
  );
}

interface AppShellProps {
  navigationTheme: ReturnType<typeof createNavigationTheme>;
  theme: ReturnType<typeof getTheme>;
}

function AppShell({ navigationTheme, theme }: AppShellProps): React.JSX.Element {
  const { initialized, isLoggedIn } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const segments = useSegments();
  const [authIntroSeen, setAuthIntroSeen] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadIntroState = async (): Promise<void> => {
      const seenIntro = await getStorageItem<boolean>(STORAGE_KEYS.authIntroSeen).catch(
        () => false
      );

      if (isMounted) {
        setAuthIntroSeen(Boolean(seenIntro));
      }
    };

    void loadIntroState();

    const subscription = DeviceEventEmitter.addListener(AUTH_INTRO_SEEN_EVENT, () => {
      setAuthIntroSeen(true);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!initialized || authIntroSeen !== false || !isLoggedIn) {
      return;
    }

    void setStorageItem(STORAGE_KEYS.authIntroSeen, true).then(() => {
      setAuthIntroSeen(true);
    });
  }, [authIntroSeen, initialized, isLoggedIn]);

  useEffect(() => {
    if (!initialized || authIntroSeen !== false || isLoggedIn) {
      return;
    }

    const isAuthRoute = segments[0] === 'auth';

    if (isAuthRoute) {
      return;
    }

    const returnTo = pathname && !pathname.startsWith('/auth') ? pathname : '/';
    router.replace(`/auth?firstVisit=1&returnTo=${encodeURIComponent(returnTo)}`);
  }, [authIntroSeen, initialized, isLoggedIn, pathname, router, segments]);

  if (!initialized || authIntroSeen === null) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
        <BrandLoader
          caption="Preparing your saved bag, wishlist, and account flow."
          fullScreen
          label="Launching Stree"
          size={84}
        />
      </View>
    );
  }

  return (
    <ThemeProvider value={navigationTheme}>
      <AppErrorBoundary>
        <StatusBar
          animated
          style={theme.isDark ? 'light' : 'dark'}
        />
        <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
          <Stack
            screenOptions={{
              animation: 'slide_from_right',
              contentStyle: {
                backgroundColor: theme.colors.background,
              },
              gestureEnabled: true,
              headerShown: false,
            }}
          />
        </View>
      </AppErrorBoundary>
    </ThemeProvider>
  );
}

/**
 * Renders the root Expo Router layout with global providers and themed navigation.
 */
function RootLayoutContent(): React.JSX.Element {
  const { themeMode } = useThemePreference();
  const theme = getTheme(themeMode);
  const navigationTheme = useMemo(
    () =>
      createNavigationTheme(
        theme.isDark,
        theme.colors.background,
        theme.colors.surface,
        theme.colors.text,
        theme.colors.border,
        theme.colors.primary
      ),
    [
      theme.colors.background,
      theme.colors.border,
      theme.colors.primary,
      theme.colors.surface,
      theme.colors.text,
      theme.isDark,
    ]
  );

  return <AppShell navigationTheme={navigationTheme} theme={theme} />;
}

/**
 * Renders the root Expo Router layout with global providers and themed navigation.
 */
export default function RootLayout(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AppProviders>
        <RootLayoutContent />
      </AppProviders>
    </SafeAreaProvider>
  );
}

import React from 'react';
import { Platform, useColorScheme } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { TAB_BAR_HEIGHT } from '../../constants/Layout';
import { useCart } from '../../hooks/useCart';
import { getTheme } from '../../lib/theme';

type TabRouteName = 'index' | 'products' | 'cart' | 'profile';

interface TabConfig {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  activeIcon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
}

const TAB_CONFIG: Record<TabRouteName, TabConfig> = {
  index: {
    icon: 'home-outline',
    activeIcon: 'home',
    title: 'Home',
  },
  products: {
    icon: 'storefront-outline',
    activeIcon: 'storefront',
    title: 'Shop',
  },
  cart: {
    icon: 'bag-handle-outline',
    activeIcon: 'bag-handle',
    title: 'Cart',
  },
  profile: {
    icon: 'person-outline',
    activeIcon: 'person',
    title: 'Profile',
  },
};

function getTabConfig(routeName: string): TabConfig {
  return TAB_CONFIG[routeName as TabRouteName] ?? TAB_CONFIG.index;
}

/**
 * Renders the bottom tab navigator for the primary Stree mobile app sections.
 */
export default function TabsLayout(): React.JSX.Element {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const { count } = useCart();
  const tabBarShadowStyle =
    Platform.OS === 'web'
      ? ({
          boxShadow: theme.isDark
            ? '0px -8px 18px rgba(0, 0, 0, 0.22)'
            : '0px -8px 18px rgba(44, 44, 44, 0.08)',
        } as const)
      : {
          shadowColor: theme.isDark ? '#000000' : '#2C2C2C',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: theme.isDark ? 0.22 : 0.08,
          shadowRadius: 18,
        };

  return (
    <Tabs
      screenOptions={({ route }) => {
        const config = getTabConfig(route.name);

        return {
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarBadge:
            route.name === 'cart' && count > 0 ? (count > 99 ? '99+' : count) : undefined,
          tabBarBadgeStyle: {
            backgroundColor: theme.colors.primary,
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: '700',
          },
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarHideOnKeyboard: true,
          tabBarItemStyle: {
            paddingVertical: 6,
          },
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              color={color}
              name={focused ? config.activeIcon : config.icon}
              size={size}
            />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            letterSpacing: 0.2,
            marginTop: Platform.OS === 'android' ? 2 : 0,
          },
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
            elevation: 0,
            height: TAB_BAR_HEIGHT,
            paddingBottom: Platform.OS === 'ios' ? 18 : 10,
            paddingTop: 10,
            ...tabBarShadowStyle,
          },
          title: config.title,
        };
      }}
    >
      <Tabs.Screen name="index" options={{ title: TAB_CONFIG.index.title }} />
      <Tabs.Screen name="products" options={{ title: TAB_CONFIG.products.title }} />
      <Tabs.Screen name="cart" options={{ title: TAB_CONFIG.cart.title }} />
      <Tabs.Screen name="profile" options={{ title: TAB_CONFIG.profile.title }} />
    </Tabs>
  );
}

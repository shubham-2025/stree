import React, { useEffect } from 'react';
import { ScrollView, Text, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import Header from '../../components/common/Header';
import BrandMark from '../../components/common/BrandMark';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { markAuthIntroSeen } from '../../lib/auth-intro';
import { DEMO_EMAIL, DEMO_PASSWORD, isDemoLoginEnabled } from '../../lib/runtime';
import { getTheme } from '../../lib/theme';

/**
 * Renders a dedicated auth choice screen so sign-in and create-account stay separate.
 */
export default function AuthEntryScreen(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams<{ firstVisit?: string; returnTo?: string }>();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const { isLoggedIn } = useAuth();
  const isFirstVisit = params.firstVisit === '1';
  const destination =
    typeof params.returnTo === 'string' && params.returnTo.length > 0 ? params.returnTo : '/';

  useEffect(() => {
    if (isLoggedIn) {
      router.replace(destination);
    }
  }, [destination, isLoggedIn, router]);

  const handleContinueAsGuest = async (): Promise<void> => {
    await markAuthIntroSeen();
    router.replace(destination);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <Header
        showBackButton={!isFirstVisit}
        showCartButton={false}
        subtitle="Welcome"
        title="Choose how you want to enter Stree"
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Card className="rounded-[28px]">
          <View className="flex-row items-start gap-4">
            <BrandMark size={52} />
            <View className="flex-1">
              <Text className="text-[24px] font-semibold" style={{ color: theme.colors.text }}>
                Sign in, create account, or continue as guest.
              </Text>
              <Text className="mt-3 text-[15px] leading-7" style={{ color: theme.colors.textMuted }}>
                Track orders with an account, save your address for faster checkout, and sign in before placing any order. You can still browse as a guest for now.
              </Text>
            </View>
          </View>

          <View className="mt-6 gap-3">
            <Button
              onPress={() =>
                router.push({
                  pathname: '/auth/login',
                  params: { returnTo: destination },
                })
              }
              text="Sign In"
            />
            <Button
              onPress={() =>
                router.push({
                  pathname: '/auth/register',
                  params: { returnTo: destination },
                })
              }
              text="Create Account"
              variant="outline"
            />
            <Button
              onPress={() => void handleContinueAsGuest()}
              text="Continue as Guest"
              variant="ghost"
            />
          </View>
        </Card>

        {isDemoLoginEnabled ? (
          <Card className="rounded-[24px]">
            <View className="flex-row items-start gap-3">
              <View
                className="h-10 w-10 items-center justify-center rounded-[14px]"
                style={{ backgroundColor: `${theme.colors.primary}12` }}
              >
                <Ionicons color={theme.colors.primary} name="flash-outline" size={18} />
              </View>
              <View className="flex-1">
                <Text className="text-[18px] font-semibold" style={{ color: theme.colors.text }}>
                  Demo login for QA
                </Text>
                <Text className="mt-2 text-[14px] leading-6" style={{ color: theme.colors.textMuted }}>
                  This test-only shortcut is hidden by default and should only be enabled in review or internal builds.
                </Text>
              </View>
            </View>

            <View
              className="mt-5 rounded-[18px] border px-4 py-4"
              style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
            >
              <Text className="text-[13px] font-semibold" style={{ color: theme.colors.textMuted }}>
                Demo email
              </Text>
              <Text className="mt-1 text-[16px] font-semibold" style={{ color: theme.colors.text }}>
                {DEMO_EMAIL}
              </Text>

              <Text className="mt-4 text-[13px] font-semibold" style={{ color: theme.colors.textMuted }}>
                Demo password
              </Text>
              <Text className="mt-1 text-[16px] font-semibold" style={{ color: theme.colors.text }}>
                {DEMO_PASSWORD}
              </Text>
            </View>

            <Button
              className="mt-4"
              onPress={() =>
                router.push({
                  pathname: '/auth/login',
                  params: {
                    email: DEMO_EMAIL,
                    password: DEMO_PASSWORD,
                    returnTo: destination,
                  },
                })
              }
              text="Use Demo Login"
            />
          </Card>
        ) : null}
      </ScrollView>
    </View>
  );
}

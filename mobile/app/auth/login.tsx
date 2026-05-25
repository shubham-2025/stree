import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAuth } from '../../hooks/useAuth';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../../contexts/AuthContext';
import { getTheme } from '../../lib/theme';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Header from '../../components/common/Header';

/**
 * Renders the login screen for customer sign-in.
 */
export default function LoginScreen(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams<{
    firstVisit?: string;
    returnTo?: string;
    email?: string;
    password?: string;
  }>();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const { error: authError, isLoggedIn, loading, login } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const destination = typeof params.returnTo === 'string'
    ? params.returnTo
    : '/profile';

  useEffect(() => {
    if (typeof params.email === 'string') {
      setEmail(params.email);
    }

    if (typeof params.password === 'string') {
      setPassword(params.password);
      setPasswordVisible(false);
    }
  }, [params.email, params.password]);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace(destination);
    }
  }, [destination, isLoggedIn, router]);

  const handleLogin = async (): Promise<void> => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await login(email, password);
      router.replace(destination);
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'Unable to sign you in right now.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <Header
        showBackButton
        showCartButton={false}
        subtitle="Account"
        title="Sign In"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Card className="rounded-[28px]">
            <Text className="text-[28px] font-semibold" style={{ color: theme.colors.text }}>
              Welcome back
            </Text>
            <Text className="mt-3 text-[15px] leading-7" style={{ color: theme.colors.textMuted }}>
              Sign in to track orders, manage saved addresses, and continue your Stree journey.
            </Text>

            <Input
              autoCapitalize="none"
              autoCorrect={false}
              containerClassName="mt-6"
              keyboardType="email-address"
              label="Email"
              onChangeText={setEmail}
              placeholder="you@example.com"
              value={email}
            />

            <Input
              containerClassName="mt-4"
              label="Password"
              onChangeText={setPassword}
              placeholder="Enter your password"
              rightIcon={
                <Pressable onPress={() => setPasswordVisible((visible) => !visible)}>
                  <Ionicons
                    color={theme.colors.textMuted}
                    name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                  />
                </Pressable>
              }
              secureTextEntry={!passwordVisible}
              value={password}
            />

            {error || authError ? (
              <Text className="mt-4 text-[14px] leading-6" style={{ color: theme.colors.error }}>
                {error ?? authError}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              className="mt-4 self-start"
              onPress={() =>
                Alert.alert(
                  'Forgot password',
                  'Password reset is currently handled through Stree support or the website sign-in flow.'
                )
              }
            >
              <Text className="text-[13px] font-semibold" style={{ color: theme.colors.primary }}>
                Forgot password?
              </Text>
            </Pressable>

            <Button
              className="mt-6"
              loading={submitting || loading}
              onPress={() => void handleLogin()}
              text="Sign In"
            />

            {(email === DEMO_EMAIL || password === DEMO_PASSWORD) ? (
              <Text className="mt-4 text-[13px] leading-6" style={{ color: theme.colors.textMuted }}>
                Demo credentials are prefilled. Tap Sign In to enter the app immediately.
              </Text>
            ) : null}
          </Card>

          <View className="mt-5 flex-row items-center justify-center gap-2">
            <Text className="text-[14px]" style={{ color: theme.colors.textMuted }}>
              New to Stree?
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: '/auth/register',
                  params: { returnTo: destination },
                })
              }
            >
              <Text className="text-[14px] font-semibold" style={{ color: theme.colors.primary }}>
                Create account
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

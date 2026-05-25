import React, { useEffect, useState } from 'react';
import {
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
import { setStorageItem, STORAGE_KEYS } from '../../lib/storage';
import { getTheme } from '../../lib/theme';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Header from '../../components/common/Header';

/**
 * Renders the registration screen for customer sign-up.
 */
export default function RegisterScreen(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams<{ firstVisit?: string; returnTo?: string }>();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const { error: authError, isLoggedIn, loading, register } = useAuth();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const destination = typeof params.returnTo === 'string'
    ? params.returnTo
    : '/profile';

  useEffect(() => {
    if (isLoggedIn) {
      router.replace(destination);
    }
  }, [destination, isLoggedIn, router]);

  const handleRegister = async (): Promise<void> => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!acceptedTerms) {
      setError('Please accept the terms to continue.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await register(name, email, password);
      await setStorageItem(STORAGE_KEYS.authIntroSeen, true).catch(() => undefined);
      router.replace(destination);
    } catch (registerError) {
      setError(
        registerError instanceof Error
          ? registerError.message
          : 'Unable to create your account right now.'
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
        title="Create Account"
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
              Create your Stree account
            </Text>
            <Text className="mt-3 text-[15px] leading-7" style={{ color: theme.colors.textMuted }}>
              Save favourites, track orders, and keep your address ready for effortless checkout.
            </Text>
            <Text className="mt-3 text-[13px] leading-6" style={{ color: theme.colors.textMuted }}>
              If signup asks for email verification, you can still enter the app immediately from the demo login on the previous screen.
            </Text>

            <Input
              containerClassName="mt-6"
              label="Name"
              onChangeText={setName}
              placeholder="Your full name"
              value={name}
            />

            <Input
              autoCapitalize="none"
              autoCorrect={false}
              containerClassName="mt-4"
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
              placeholder="At least 6 characters"
              secureTextEntry
              value={password}
            />

            <Input
              containerClassName="mt-4"
              label="Confirm Password"
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              secureTextEntry
              value={confirmPassword}
            />

            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: acceptedTerms }}
              className="mt-5 flex-row items-start gap-3"
              onPress={() => setAcceptedTerms((currentValue) => !currentValue)}
            >
              <View
                className="mt-0.5 h-5 w-5 items-center justify-center rounded-md border"
                style={{
                  backgroundColor: acceptedTerms ? theme.colors.primary : theme.colors.surface,
                  borderColor: acceptedTerms ? theme.colors.primary : theme.colors.border,
                }}
              >
                {acceptedTerms ? (
                  <Ionicons color="#FFFFFF" name="checkmark" size={14} />
                ) : null}
              </View>

              <Text className="flex-1 text-[14px] leading-6" style={{ color: theme.colors.textMuted }}>
                {"I agree to Stree's terms and would like to continue with cash on delivery orders."}
              </Text>
            </Pressable>

            {error || authError ? (
              <Text className="mt-4 text-[14px] leading-6" style={{ color: theme.colors.error }}>
                {error ?? authError}
              </Text>
            ) : null}

            <Button
              className="mt-6"
              loading={submitting || loading}
              onPress={() => void handleRegister()}
              text="Create Account"
            />
          </Card>

          <View className="mt-5 flex-row items-center justify-center gap-2">
            <Text className="text-[14px]" style={{ color: theme.colors.textMuted }}>
              Already have an account?
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: '/auth/login',
                  params: { returnTo: destination },
                })
              }
            >
              <Text className="text-[14px] font-semibold" style={{ color: theme.colors.primary }}>
                Sign in
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

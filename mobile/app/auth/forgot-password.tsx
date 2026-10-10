import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAuth } from '../../hooks/useAuth';
import { getTheme } from '../../lib/theme';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Header from '../../components/common/Header';

/**
 * Lets customers request a live password-reset email for their Stree account.
 */
export default function ForgotPasswordScreen(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const { error: authError, loading, requestPasswordReset } = useAuth();
  const [email, setEmail] = useState<string>(
    typeof params.email === 'string' ? params.email : ''
  );
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (): Promise<void> => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await requestPasswordReset(email);
      setSuccessMessage(
        `If ${email.trim().toLowerCase()} is registered, a password reset link has been sent. Open the email, set a new password, then come back and sign in.`
      );
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : 'Unable to send reset email right now.'
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
        title="Reset Password"
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
              Forgot your password?
            </Text>
            <Text className="mt-3 text-[15px] leading-7" style={{ color: theme.colors.textMuted }}>
              Enter the email linked to your Stree account. We will send a secure reset link so you can choose a new password.
            </Text>

            <Input
              autoCapitalize="none"
              autoCorrect={false}
              containerClassName="mt-6"
              keyboardType="email-address"
              label="Email"
              onChangeText={setEmail}
              placeholder="you@example.com"
              required
              value={email}
            />

            {successMessage ? (
              <Text className="mt-4 text-[14px] leading-6" style={{ color: theme.colors.success }}>
                {successMessage}
              </Text>
            ) : null}

            {error || (!successMessage ? authError : null) ? (
              <Text className="mt-4 text-[14px] leading-6" style={{ color: theme.colors.error }}>
                {error ?? authError}
              </Text>
            ) : null}

            <Button
              className="mt-6"
              loading={submitting || loading}
              onPress={() => void handleSubmit()}
              text={
                submitting || loading
                  ? 'Please wait, sending reset link…'
                  : 'Send Reset Link'
              }
            />

            {successMessage ? (
              <Button
                className="mt-3"
                onPress={() =>
                  router.replace({
                    pathname: '/auth/login',
                    params: { email: email.trim().toLowerCase() },
                  })
                }
                text="Back to Sign In"
                variant="outline"
              />
            ) : null}
          </Card>

          <View className="mt-5 flex-row items-center justify-center gap-2">
            <Text className="text-[14px]" style={{ color: theme.colors.textMuted }}>
              Remembered your password?
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: '/auth/login',
                  params: { email: email.trim().toLowerCase() },
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

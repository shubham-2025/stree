import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { fetchMyOrders } from '../../lib/api';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../../lib/storage';
import { getTheme } from '../../lib/theme';
import type { Address, Order } from '../../lib/types';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';
import { useWishlist } from '../../hooks/useWishlist';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/common/EmptyState';
import Header from '../../components/common/Header';
import BrandLoader from '../../components/common/BrandLoader';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatPrice } from '../../components/common/PriceTag';

interface ProfilePreferences {
  notificationsEnabled: boolean;
}

interface ProfileFormState {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

const DEFAULT_PREFERENCES: ProfilePreferences = {
  notificationsEnabled: true,
};

function getStatusVariant(status: Order['status']): 'primary' | 'secondary' | 'success' | 'outline' {
  switch (status) {
    case 'delivered':
      return 'success';
    case 'confirmed':
    case 'shipped':
      return 'secondary';
    case 'cancelled':
      return 'outline';
    case 'pending':
    default:
      return 'primary';
  }
}

function formatOrderDate(date: string): string {
  if (!date) {
    return 'Recently placed';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(new Date(date));
}

function createProfileFormState(
  name = '',
  email = '',
  phone = '',
  address?: Address
): ProfileFormState {
  return {
    name,
    email,
    phone,
    line1: address?.line1 ?? '',
    line2: address?.line2 ?? '',
    city: address?.city ?? '',
    state: address?.state ?? '',
    pincode: address?.pincode ?? '',
  };
}

function mergeOrders(primaryOrders: Order[], secondaryOrders: Order[]): Order[] {
  return Array.from(
    new Map(
      [...primaryOrders, ...secondaryOrders].map((order) => [order.id, order])
    ).values()
  );
}

function buildDefaultAddress(formState: ProfileFormState): Address | undefined {
  if (
    !formState.line1.trim() &&
    !formState.line2.trim() &&
    !formState.city.trim() &&
    !formState.state.trim() &&
    !formState.pincode.trim()
  ) {
    return undefined;
  }

  return {
    name: formState.name.trim(),
    phone: formState.phone.trim(),
    line1: formState.line1.trim(),
    line2: formState.line2.trim() || undefined,
    city: formState.city.trim(),
    state: formState.state.trim(),
    pincode: formState.pincode.trim(),
  };
}

/**
 * Renders the profile screen with auth state, local order history, and settings.
 */
export default function ProfileScreen(): React.JSX.Element {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const { count } = useCart();
  const { showToast } = useToast();
  const { count: wishlistCount } = useWishlist();
  const { error, initialized, isLoggedIn, loading, logout, token, updateUser, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [preferences, setPreferences] = useState<ProfilePreferences>(DEFAULT_PREFERENCES);
  const [editVisible, setEditVisible] = useState<boolean>(false);
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [profileForm, setProfileForm] = useState<ProfileFormState>(
    createProfileFormState()
  );

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()
      ),
    [orders]
  );

  const loadProfileData = useCallback(async (): Promise<void> => {
    try {
      const [storedOrders, storedPreferences] = await Promise.all([
        getStorageItem<Order[]>(STORAGE_KEYS.orderHistory),
        getStorageItem<ProfilePreferences>(STORAGE_KEYS.preferences),
      ]);

      const normalizedOrders = Array.isArray(storedOrders)
        ? storedOrders.map((order) => ({
            ...order,
            status: order.status === 'pending' ? 'confirmed' : order.status,
          }))
        : [];
      const serverOrders =
        isLoggedIn && token
          ? await fetchMyOrders(token).catch(() => [])
          : [];

      setOrders(mergeOrders(serverOrders, normalizedOrders));
      setPreferences(storedPreferences ?? DEFAULT_PREFERENCES);
    } catch {
      setOrders([]);
      setPreferences(DEFAULT_PREFERENCES);
    }
  }, [isLoggedIn, token]);

  useFocusEffect(
    useCallback(() => {
      void loadProfileData();
      return undefined;
    }, [loadProfileData])
  );

  useEffect(() => {
    setProfileForm(
      createProfileFormState(
        user?.name ?? '',
        user?.email ?? '',
        user?.phone ?? '',
        user?.defaultAddress
      )
    );
  }, [user]);

  const persistPreferences = useCallback(
    async (nextPreferences: ProfilePreferences): Promise<void> => {
      setPreferences(nextPreferences);
      await setStorageItem(STORAGE_KEYS.preferences, nextPreferences).catch(() => undefined);
    },
    []
  );

  const handleSaveProfile = useCallback(async (): Promise<void> => {
    if (!user) {
      return;
    }

    if (!profileForm.name.trim()) {
      Alert.alert('Profile', 'Please enter your name.');
      return;
    }

    setSavingProfile(true);

    try {
      await updateUser({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        defaultAddress: buildDefaultAddress(profileForm),
      });
      setEditVisible(false);
      showToast({
        title: 'Profile updated',
        message: 'Your saved contact and address details are ready for checkout.',
        iconName: 'sparkles-outline',
        tone: 'success',
      });
    } finally {
      setSavingProfile(false);
    }
  }, [profileForm, showToast, updateUser, user]);

  if (!initialized || loading) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
        <Header cartCount={count} subtitle="Account" title="Profile" />
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          <BrandLoader caption="Loading your saved profile and order history." label="Loading profile" />
          <LoadingSkeleton count={2} variant="list" />
        </ScrollView>
      </View>
    );
  }

  if (!isLoggedIn || !user) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
        <Header cartCount={count} subtitle="Account" title="Profile" />
        <EmptyState
          ctaLabel="Login"
          fullScreen
          iconName="person-circle-outline"
          message="Sign in to track orders, save addresses, and keep your wishlist close."
          onPressCta={() => router.push('/auth/login')}
          onPressSecondary={() => router.push('/auth/register')}
          secondaryLabel="Register"
          title="Welcome to Stree"
        />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <Header cartCount={count} subtitle="Account" title="Profile" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 28, paddingHorizontal: 16, paddingTop: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <Card className="rounded-[26px]">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-[24px] font-semibold" style={{ color: theme.colors.text }}>
                {user.name}
              </Text>
              <Text className="mt-2 text-[14px]" style={{ color: theme.colors.textMuted }}>
                {user.email}
              </Text>
              <Text className="mt-1 text-[14px]" style={{ color: theme.colors.textMuted }}>
                {user.phone || 'Add a phone number'}
              </Text>
            </View>

            <Button
              fullWidth={false}
              onPress={() => setEditVisible(true)}
              text="Edit Profile"
              variant="outline"
            />
          </View>
        </Card>

        <View className="mt-6">
          <Text className="text-[22px] font-semibold" style={{ color: theme.colors.text }}>
            Wishlist & Favourites
          </Text>

          <Card className="mt-4 rounded-[22px]">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="text-[15px] font-semibold" style={{ color: theme.colors.text }}>
                  View Wishlist
                </Text>
                <Text className="mt-2 text-[14px] leading-6" style={{ color: theme.colors.textMuted }}>
                  {wishlistCount > 0
                    ? `${wishlistCount} saved favourite${wishlistCount === 1 ? '' : 's'} waiting for you.`
                    : 'Tap heart on any saree and keep it saved here for later.'}
                </Text>
              </View>

              <Button
                fullWidth={false}
                onPress={() => router.push('/wishlist')}
                text="Open"
                variant="secondary"
              />
            </View>
          </Card>
        </View>

        <View className="mt-6">
          <Text className="text-[22px] font-semibold" style={{ color: theme.colors.text }}>
            My Orders
          </Text>
          <Text className="mt-1 text-[14px]" style={{ color: theme.colors.textMuted }}>
            Recent orders you have placed from this device.
          </Text>

          <View className="mt-4 gap-3">
            {sortedOrders.length === 0 ? (
              <Card>
                <Text className="text-[15px] font-medium" style={{ color: theme.colors.text }}>
                  No orders yet
                </Text>
                <Text className="mt-2 text-[14px] leading-6" style={{ color: theme.colors.textMuted }}>
                  Once you place your first order, it will appear here with its latest status.
                </Text>
              </Card>
            ) : (
              sortedOrders.map((order) => (
                <Card key={order.id} className="rounded-[22px]">
                  <View className="flex-row items-start justify-between gap-4">
                    <View className="flex-1">
                      <Text className="text-[15px] font-semibold" style={{ color: theme.colors.text }}>
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </Text>
                      <Text className="mt-1 text-[13px]" style={{ color: theme.colors.textMuted }}>
                        {formatOrderDate(order.date)}
                      </Text>
                    </View>

                    <Badge
                      text={order.status}
                      variant={getStatusVariant(order.status)}
                    />
                  </View>

                  <View className="mt-4 flex-row items-center justify-between">
                    <Text className="text-[14px]" style={{ color: theme.colors.textMuted }}>
                      {order.items.length} item{order.items.length === 1 ? '' : 's'}
                    </Text>
                    <Text className="text-[16px] font-semibold" style={{ color: theme.colors.primary }}>
                      {formatPrice(order.total)}
                    </Text>
                  </View>
                </Card>
              ))
            )}
          </View>
        </View>

        <View className="mt-6">
          <Text className="text-[22px] font-semibold" style={{ color: theme.colors.text }}>
            Address Book
          </Text>

          <Card className="mt-4 rounded-[22px]">
            {user.defaultAddress ? (
              <View className="gap-1.5">
                <Text className="text-[15px] font-semibold" style={{ color: theme.colors.text }}>
                  {user.defaultAddress.name}
                </Text>
                <Text className="text-[14px]" style={{ color: theme.colors.textMuted }}>
                  {user.defaultAddress.phone}
                </Text>
                <Text className="text-[14px] leading-6" style={{ color: theme.colors.textMuted }}>
                  {user.defaultAddress.line1}
                  {user.defaultAddress.line2 ? `, ${user.defaultAddress.line2}` : ''}
                  {`\n${user.defaultAddress.city}, ${user.defaultAddress.state} ${user.defaultAddress.pincode}`}
                </Text>
              </View>
            ) : (
              <Text className="text-[14px] leading-6" style={{ color: theme.colors.textMuted }}>
                No saved address yet. Add one from Edit Profile or during checkout.
              </Text>
            )}
          </Card>
        </View>

        <View className="mt-6">
          <Text className="text-[22px] font-semibold" style={{ color: theme.colors.text }}>
            Settings
          </Text>

          <Card className="mt-4 rounded-[22px]">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-[15px] font-semibold" style={{ color: theme.colors.text }}>
                  Notifications
                </Text>
                <Text className="mt-1 text-[14px] leading-6" style={{ color: theme.colors.textMuted }}>
                  Receive updates for order status and curated arrivals.
                </Text>
              </View>

              <Switch
                onValueChange={(value) =>
                  void persistPreferences({ notificationsEnabled: value })
                }
                thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                value={preferences.notificationsEnabled}
              />
            </View>
          </Card>
        </View>

        {error ? (
          <Card className="mt-6 rounded-[22px]">
            <Text className="text-[14px] leading-6" style={{ color: theme.colors.error }}>
              {error}
            </Text>
          </Card>
        ) : null}

        <Button
          className="mt-6"
          onPress={() =>
            Alert.alert('Logout', 'Are you sure you want to logout?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Logout',
                style: 'destructive',
                onPress: () => void logout(),
              },
            ])
          }
          text="Logout"
          variant="outline"
        />
      </ScrollView>

      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        transparent={false}
        visible={editVisible}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1"
          >
            <Header
              showBackButton
              showCartButton={false}
              title="Edit Profile"
              onPressBack={() => setEditVisible(false)}
            />

            <ScrollView
              className="flex-1"
              contentContainerStyle={{ padding: 16, paddingBottom: 28, gap: 16 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Card className="rounded-[24px]">
                <Input
                  label="Name"
                  onChangeText={(value) =>
                    setProfileForm((current) => ({ ...current, name: value }))
                  }
                  placeholder="Your name"
                  value={profileForm.name}
                />

                <Input
                  containerClassName="mt-4"
                  editable={false}
                  label="Email"
                  value={profileForm.email}
                />

                <Input
                  containerClassName="mt-4"
                  keyboardType="phone-pad"
                  label="Phone"
                  onChangeText={(value) =>
                    setProfileForm((current) => ({ ...current, phone: value }))
                  }
                  placeholder="10-digit mobile number"
                  value={profileForm.phone}
                />
              </Card>

              <Card className="rounded-[24px]">
                <Text className="text-[16px] font-semibold" style={{ color: theme.colors.text }}>
                  Default Address
                </Text>

                <Input
                  containerClassName="mt-4"
                  label="Address Line 1"
                  onChangeText={(value) =>
                    setProfileForm((current) => ({ ...current, line1: value }))
                  }
                  placeholder="House no., street, area"
                  value={profileForm.line1}
                />

                <Input
                  containerClassName="mt-4"
                  label="Address Line 2"
                  onChangeText={(value) =>
                    setProfileForm((current) => ({ ...current, line2: value }))
                  }
                  placeholder="Apartment, suite, landmark"
                  value={profileForm.line2}
                />

                <Input
                  containerClassName="mt-4"
                  label="City"
                  onChangeText={(value) =>
                    setProfileForm((current) => ({ ...current, city: value }))
                  }
                  placeholder="City"
                  value={profileForm.city}
                />

                <Input
                  containerClassName="mt-4"
                  label="State"
                  onChangeText={(value) =>
                    setProfileForm((current) => ({ ...current, state: value }))
                  }
                  placeholder="State"
                  value={profileForm.state}
                />

                <Input
                  containerClassName="mt-4"
                  keyboardType="number-pad"
                  label="Pincode"
                  onChangeText={(value) =>
                    setProfileForm((current) => ({ ...current, pincode: value }))
                  }
                  placeholder="6-digit pincode"
                  value={profileForm.pincode}
                />
              </Card>

              <Button
                loading={savingProfile}
                onPress={() => void handleSaveProfile()}
                text="Save Changes"
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

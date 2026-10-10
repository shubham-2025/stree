import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { fetchMyOrders, getApiErrorMessage } from '../../lib/api';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../../lib/storage';
import { DEFAULT_PREFERENCES, normalizePreferences, type AppPreferences } from '../../lib/preferences';
import { getTheme } from '../../lib/theme';
import type { Address, Order } from '../../lib/types';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useThemePreference } from '../../hooks/useThemePreference';
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

function formatAddressBlock(address: Address): string {
  const lines = [
    address.line1,
    address.line2,
    [address.city, address.state].filter(Boolean).join(', '),
    address.pincode,
  ].filter(Boolean);

  return lines.join('\n');
}

function formatOrderStatus(status: Order['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
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
      [...secondaryOrders, ...primaryOrders].map((order) => [order.id, order])
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
  const { setThemeMode, themeMode } = useThemePreference();
  const theme = getTheme(themeMode);
  const { count } = useCart();
  const { showToast } = useToast();
  const { count: wishlistCount } = useWishlist();
  const { error, initialized, isLoggedIn, loading, logout, token, updateUser, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [preferences, setPreferences] = useState<AppPreferences>(DEFAULT_PREFERENCES);
  const [editVisible, setEditVisible] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
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
        getStorageItem<unknown>(STORAGE_KEYS.preferences),
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
      setPreferences(normalizePreferences(storedPreferences));
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
    async (nextPreferences: AppPreferences): Promise<void> => {
      setPreferences(nextPreferences);
      await setStorageItem(STORAGE_KEYS.preferences, nextPreferences).catch(() => undefined);
    },
    []
  );

  const handleThemeModeChange = useCallback(
    async (enabled: boolean): Promise<void> => {
      const nextThemeMode = enabled ? 'dark' : 'light';
      const nextPreferences: AppPreferences = {
        ...preferences,
        themeMode: nextThemeMode,
      };

      setPreferences(nextPreferences);
      await setThemeMode(nextThemeMode);
      showToast({
        title: enabled ? 'Dark mode enabled' : 'Light mode enabled',
        message: enabled
          ? 'Your Stree app now uses a darker palette for low-light browsing.'
          : 'Stree is back to the default light theme.',
        iconName: enabled ? 'moon-outline' : 'sunny-outline',
        tone: 'primary',
      });
    },
    [preferences, setThemeMode, showToast]
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
    } catch (saveError) {
      Alert.alert(
        'Profile',
        getApiErrorMessage(saveError, 'Unable to save your profile right now.')
      );
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
                <Pressable
                  key={order.id}
                  accessibilityRole="button"
                  onPress={() => setSelectedOrder(order)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.96 : 1,
                  })}
                >
                  <Card className="rounded-[22px]">
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
                        text={formatOrderStatus(order.status)}
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

                    <Text className="mt-4 text-[13px] font-semibold" style={{ color: theme.colors.primary }}>
                      View order details
                    </Text>
                  </Card>
                </Pressable>
              ))
            )}
          </View>
        </View>

        <View className="mt-6">
          <View className="flex-row items-center justify-between gap-4">
            <Text className="text-[22px] font-semibold" style={{ color: theme.colors.text }}>
              Address Book
            </Text>
            <Button
              fullWidth={false}
              onPress={() => setEditVisible(true)}
              text={user.defaultAddress ? 'Edit Address' : 'Add Address'}
              variant="outline"
            />
          </View>

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
                  void persistPreferences({
                    ...preferences,
                    notificationsEnabled: value,
                  })
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

          <Card className="mt-4 rounded-[22px]">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-[15px] font-semibold" style={{ color: theme.colors.text }}>
                  Dark Mode
                </Text>
                <Text className="mt-1 text-[14px] leading-6" style={{ color: theme.colors.textMuted }}>
                  Stree stays light by default. Turn this on only when you want the darker look.
                </Text>
              </View>

              <Switch
                onValueChange={(value) => void handleThemeModeChange(value)}
                thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                value={preferences.themeMode === 'dark'}
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
        visible={Boolean(selectedOrder)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <Header
            showBackButton
            showCartButton={false}
            subtitle="Orders"
            title="Order Details"
            onPressBack={() => setSelectedOrder(null)}
          />

          {selectedOrder ? (
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ padding: 16, paddingBottom: 28, gap: 16 }}
              showsVerticalScrollIndicator={false}
            >
              <Card className="rounded-[24px]">
                <View className="flex-row items-start justify-between gap-4">
                  <View className="flex-1">
                    <Text className="text-[18px] font-semibold" style={{ color: theme.colors.text }}>
                      Order #{selectedOrder.id.slice(0, 8).toUpperCase()}
                    </Text>
                    <Text className="mt-2 text-[14px]" style={{ color: theme.colors.textMuted }}>
                      Placed on {formatOrderDate(selectedOrder.date)}
                    </Text>
                  </View>

                  <Badge
                    text={formatOrderStatus(selectedOrder.status)}
                    variant={getStatusVariant(selectedOrder.status)}
                  />
                </View>
              </Card>

              <Card className="rounded-[24px]">
                <Text className="text-[16px] font-semibold" style={{ color: theme.colors.text }}>
                  Items in this order
                </Text>

                <View className="mt-4 gap-4">
                  {selectedOrder.items.map((item) => (
                    <View
                      key={`${selectedOrder.id}-${item.id}`}
                      className="flex-row items-start justify-between gap-4 border-b pb-4"
                      style={{ borderColor: theme.colors.border }}
                    >
                      <View className="flex-1">
                        <Text className="text-[15px] font-semibold" style={{ color: theme.colors.text }}>
                          {item.name}
                        </Text>
                        <Text className="mt-1 text-[13px]" style={{ color: theme.colors.textMuted }}>
                          Qty {item.quantity} | {item.category}
                        </Text>
                      </View>
                      <Text className="text-[15px] font-semibold" style={{ color: theme.colors.primary }}>
                        {formatPrice(item.price * item.quantity)}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>

              <Card className="rounded-[24px]">
                <Text className="text-[16px] font-semibold" style={{ color: theme.colors.text }}>
                  Delivery address
                </Text>
                <Text className="mt-4 text-[15px] font-semibold" style={{ color: theme.colors.text }}>
                  {selectedOrder.address.name}
                </Text>
                <Text className="mt-1 text-[14px]" style={{ color: theme.colors.textMuted }}>
                  {selectedOrder.address.phone}
                </Text>
                <Text className="mt-2 text-[14px] leading-6" style={{ color: theme.colors.textMuted }}>
                  {formatAddressBlock(selectedOrder.address)}
                </Text>
              </Card>

              <Card className="rounded-[24px]">
                <Text className="text-[16px] font-semibold" style={{ color: theme.colors.text }}>
                  Payment & total
                </Text>
                <View className="mt-4 gap-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[14px]" style={{ color: theme.colors.textMuted }}>
                      Payment method
                    </Text>
                    <Text className="text-[14px] font-semibold" style={{ color: theme.colors.text }}>
                      Cash on Delivery
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[14px]" style={{ color: theme.colors.textMuted }}>
                      Order total
                    </Text>
                    <Text className="text-[20px] font-bold" style={{ color: theme.colors.primary }}>
                      {formatPrice(selectedOrder.total)}
                    </Text>
                  </View>
                </View>
              </Card>
            </ScrollView>
          ) : null}
        </SafeAreaView>
      </Modal>

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
                  required
                  value={profileForm.name}
                />

                <Input
                  containerClassName="mt-4"
                  editable={false}
                  label="Email"
                  required
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
                  required
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
                  required
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
                  required
                  value={profileForm.city}
                />

                <Input
                  containerClassName="mt-4"
                  label="State"
                  onChangeText={(value) =>
                    setProfileForm((current) => ({ ...current, state: value }))
                  }
                  placeholder="State"
                  required
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
                  required
                  value={profileForm.pincode}
                />
              </Card>

              <Button
                loading={savingProfile}
                onPress={() => void handleSaveProfile()}
                text={
                  savingProfile
                    ? 'Please wait, saving your details…'
                    : 'Save Changes'
                }
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

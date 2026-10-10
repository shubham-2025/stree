import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
  getApiErrorMessage,
  resolveOrderItemImage,
  submitMobileOrder,
  type MobileOrderSubmissionPayload,
} from '../lib/api';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../lib/storage';
import { getTheme } from '../lib/theme';
import type { Address, Order, OrderItem } from '../lib/types';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import EmptyState from '../components/common/EmptyState';
import Header from '../components/common/Header';
import { formatPrice } from '../components/common/PriceTag';

interface CheckoutFormState {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

interface StoredCheckoutProfile {
  name: string;
  email: string;
  phone: string;
  defaultAddress?: Address;
}

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Chandigarh',
  'Puducherry',
] as const;

function createOrderId(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  const randomSegment = (): string =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .slice(1);

  return `${randomSegment()}${randomSegment()}-${randomSegment()}-4${randomSegment().slice(1)}-a${randomSegment().slice(1)}-${randomSegment()}${randomSegment()}${randomSegment()}`;
}

function createOrderItems(items: ReturnType<typeof useCart>['items']): OrderItem[] {
  return items.map((item) => ({
    productId: item.id,
    title: item.name,
    price: item.price,
    qty: item.quantity,
    image: resolveOrderItemImage(item.image, item.images),
  }));
}

function createDefaultFormState(): CheckoutFormState {
  return {
    name: '',
    email: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
  };
}

function createAddressFromForm(formState: CheckoutFormState): Address {
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

function createStoredCheckoutProfile(formState: CheckoutFormState): StoredCheckoutProfile {
  return {
    name: formState.name.trim(),
    email: formState.email.trim().toLowerCase(),
    phone: formState.phone.trim(),
    defaultAddress: createAddressFromForm(formState),
  };
}

function validateCheckoutForm(formState: CheckoutFormState): string | null {
  if (
    !formState.name.trim() ||
    !formState.email.trim() ||
    !formState.phone.trim() ||
    !formState.line1.trim() ||
    !formState.city.trim() ||
    !formState.state.trim() ||
    !formState.pincode.trim()
  ) {
    return 'Please fill all required fields.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())) {
    return 'Please enter a valid email address.';
  }

  if (!/^[6-9]\d{9}$/.test(formState.phone.replace(/\s+/g, ''))) {
    return 'Please enter a valid 10-digit mobile number.';
  }

  if (!/^\d{6}$/.test(formState.pincode.trim())) {
    return 'Please enter a valid 6-digit pincode.';
  }

  return null;
}

async function persistOrderHistory(order: Order): Promise<void> {
  const currentOrders = (await getStorageItem<Order[]>(STORAGE_KEYS.orderHistory)) ?? [];
  await setStorageItem(STORAGE_KEYS.orderHistory, [order, ...currentOrders]);
}

/**
 * Renders the checkout flow with COD address form, order summary, and success state.
 */
export default function CheckoutScreen(): React.JSX.Element {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const { clear, items, total } = useCart();
  const { isLoggedIn, token, updateUser, user } = useAuth();
  const [form, setForm] = useState<CheckoutFormState>(createDefaultFormState());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [statePickerOpen, setStatePickerOpen] = useState<boolean>(false);
  const deliveryFee = useMemo(() => (total === 0 ? 0 : 29), [total]);
  const grandTotal = total + deliveryFee;

  const orderItems = useMemo(() => createOrderItems(items), [items]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm((currentForm) => ({
      ...currentForm,
      name: currentForm.name || user.name,
      email: currentForm.email || user.email,
      phone: currentForm.phone || user.phone,
      line1: currentForm.line1 || user.defaultAddress?.line1 || '',
      line2: currentForm.line2 || user.defaultAddress?.line2 || '',
      city: currentForm.city || user.defaultAddress?.city || '',
      state: currentForm.state || user.defaultAddress?.state || 'Maharashtra',
      pincode: currentForm.pincode || user.defaultAddress?.pincode || '',
    }));
  }, [user]);

  useEffect(() => {
    if (user) {
      return;
    }

    let isMounted = true;

    const loadStoredCheckoutProfile = async (): Promise<void> => {
      const storedProfile = await getStorageItem<StoredCheckoutProfile>(
        STORAGE_KEYS.guestCheckoutProfile
      ).catch(() => null);

      if (!isMounted || !storedProfile) {
        return;
      }

      setForm((currentForm) => ({
        ...currentForm,
        name: currentForm.name || storedProfile.name || '',
        email: currentForm.email || storedProfile.email || '',
        phone: currentForm.phone || storedProfile.phone || '',
        line1: currentForm.line1 || storedProfile.defaultAddress?.line1 || '',
        line2: currentForm.line2 || storedProfile.defaultAddress?.line2 || '',
        city: currentForm.city || storedProfile.defaultAddress?.city || '',
        state: currentForm.state || storedProfile.defaultAddress?.state || 'Maharashtra',
        pincode: currentForm.pincode || storedProfile.defaultAddress?.pincode || '',
      }));
    };

    void loadStoredCheckoutProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handlePlaceOrder = useCallback(async (): Promise<void> => {
    const validationError = validateCheckoutForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (orderItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const orderId = createOrderId();
    const payload: MobileOrderSubmissionPayload = {
      id: orderId,
      customer_name: form.name.trim(),
      customer_email: form.email.trim().toLowerCase(),
      phone: form.phone.replace(/\s+/g, ''),
      address_line1: form.line1.trim(),
      address_line2: form.line2.trim() || null,
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      landmark: null,
      items: orderItems,
      total_amount: grandTotal,
      status: 'NEW',
    };

    try {
      const placedOrderId = await submitMobileOrder(payload, {
        accessToken: token,
        userId: user?.id ?? null,
      });

      const address = createAddressFromForm(form);
      const order: Order = {
        id: placedOrderId,
        date: new Date().toISOString(),
        status: 'confirmed',
        items: items.map((item) => ({ ...item })),
        total: grandTotal,
        address,
      };

      await persistOrderHistory(order).catch(() => undefined);
      await setStorageItem(
        STORAGE_KEYS.guestCheckoutProfile,
        createStoredCheckoutProfile(form)
      ).catch(() => undefined);

      if (isLoggedIn) {
        void updateUser({
          name: form.name.trim(),
          phone: form.phone.trim(),
          defaultAddress: address,
        }).catch(() => undefined);
      }

      clear();
      setCompletedOrder(order);
    } catch (placeOrderError) {
      setError(
        getApiErrorMessage(
          placeOrderError,
          'Unable to place your order right now. Please try again.'
        )
      );
    } finally {
      setSubmitting(false);
    }
  }, [clear, form, grandTotal, isLoggedIn, items, orderItems, token, updateUser, user?.id]);

  if (completedOrder) {
    const confirmationEmail =
      form.email.trim().toLowerCase() || 'your registered email';

    return (
      <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
        <Header showCartButton={false} subtitle="Success" title="Order Confirmed" />
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <Card className="items-center rounded-[28px] px-5 py-8">
            <View
              className="h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: `${theme.colors.success}18` }}
            >
              <Ionicons color={theme.colors.success} name="checkmark-circle" size={52} />
            </View>
            <Text
              className="mt-5 text-center text-[26px] font-semibold"
              style={{ color: theme.colors.text }}
            >
              Order placed successfully
            </Text>
            <Text
              className="mt-2 text-center text-[14px] leading-6"
              style={{ color: theme.colors.textMuted }}
            >
              Cash on Delivery confirmed. A purchase email with these details was sent to{' '}
              {confirmationEmail}.
            </Text>
          </Card>

          <Card className="mt-4 rounded-[26px]">
            <Text className="text-[13px] font-medium uppercase tracking-[0.6px]" style={{ color: theme.colors.textMuted }}>
              Purchase / Tracking ID
            </Text>
            <Text
              className="mt-2 text-[16px] font-semibold"
              selectable
              style={{ color: theme.colors.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}
            >
              {completedOrder.id}
            </Text>
          </Card>

          <Card className="mt-4 rounded-[26px]">
            <Text className="text-[18px] font-semibold" style={{ color: theme.colors.text }}>
              Items purchased
            </Text>
            <View className="mt-4 gap-4">
              {completedOrder.items.map((item) => (
                <View
                  key={`${item.id}-${item.quantity}`}
                  className="flex-row items-start justify-between gap-3 border-b pb-4"
                  style={{ borderColor: theme.colors.border }}
                >
                  <View className="flex-1">
                    <Text className="text-[15px] font-semibold" style={{ color: theme.colors.text }}>
                      {item.name}
                    </Text>
                    <Text className="mt-1 text-[13px]" style={{ color: theme.colors.textMuted }}>
                      Quantity: {item.quantity}
                    </Text>
                  </View>
                  <Text className="text-[15px] font-semibold" style={{ color: theme.colors.primary }}>
                    {formatPrice(item.price * item.quantity)}
                  </Text>
                </View>
              ))}
            </View>

            <View
              className="mt-4 gap-3 border-t pt-4"
              style={{ borderColor: theme.colors.border }}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-[14px]" style={{ color: theme.colors.textMuted }}>
                  Items subtotal
                </Text>
                <Text className="text-[14px] font-semibold" style={{ color: theme.colors.text }}>
                  {formatPrice(
                    completedOrder.items.reduce(
                      (sum, item) => sum + item.price * item.quantity,
                      0
                    )
                  )}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-[14px]" style={{ color: theme.colors.textMuted }}>
                  Delivery fee
                </Text>
                <Text className="text-[14px] font-semibold" style={{ color: theme.colors.text }}>
                  {formatPrice(29)}
                </Text>
              </View>
              <Text className="text-[12px]" style={{ color: theme.colors.textMuted }}>
                Flat ₹29 delivery fee on every order
              </Text>
              <View className="flex-row items-center justify-between pt-1">
                <Text className="text-[16px] font-semibold" style={{ color: theme.colors.text }}>
                  Payable total
                </Text>
                <Text className="text-[22px] font-bold" style={{ color: theme.colors.success }}>
                  {formatPrice(completedOrder.total)}
                </Text>
              </View>
            </View>
          </Card>

          <Card className="mt-4 rounded-[26px]">
            <Text className="text-[18px] font-semibold" style={{ color: theme.colors.text }}>
              Delivery address
            </Text>
            <Text className="mt-3 text-[14px] leading-6" style={{ color: theme.colors.textMuted }}>
              {completedOrder.address.name}
              {'\n'}
              {completedOrder.address.phone}
              {'\n'}
              {completedOrder.address.line1}
              {completedOrder.address.line2 ? `, ${completedOrder.address.line2}` : ''}
              {'\n'}
              {completedOrder.address.city}, {completedOrder.address.state} -{' '}
              {completedOrder.address.pincode}
            </Text>
          </Card>

          <Button
            className="mt-6"
            onPress={() => router.replace('/products')}
            text="Continue Shopping"
          />
          <Button
            className="mt-3"
            onPress={() => router.replace('/profile')}
            text="View Profile"
            variant="outline"
          />
        </ScrollView>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
        <Header showBackButton showCartButton={false} subtitle="Checkout" title="Checkout" />
        <EmptyState
          ctaLabel="Continue Shopping"
          fullScreen
          message="Your cart is empty. Add a few sarees before heading to checkout."
          onPressCta={() => router.replace('/products')}
          title="Nothing to checkout"
        />
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
        <Header showBackButton showCartButton={false} subtitle="Checkout" title="Checkout" />
        <EmptyState
          ctaLabel="Sign In to Continue"
          fullScreen
          iconName="lock-closed-outline"
          message="To place an order and track it inside your account, please sign in or create your Stree account first."
          onPressCta={() => router.replace('/auth/login?returnTo=%2Fcheckout')}
          onPressSecondary={() => router.replace('/auth/register?returnTo=%2Fcheckout')}
          secondaryLabel="Create Account"
          title="Login required for checkout"
        />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <Header showBackButton showCartButton={false} subtitle="Checkout" title="Checkout" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-4 pt-4">
            <Card className="rounded-[26px]">
              <Text className="text-[24px] font-semibold" style={{ color: theme.colors.text }}>
                Delivery Address
              </Text>
              <Text className="mt-2 text-[15px] leading-7" style={{ color: theme.colors.textMuted }}>
                Cash on Delivery is available for every order. Please enter accurate delivery details.
              </Text>

              <Input
                containerClassName="mt-6"
                label="Full Name"
                onChangeText={(value) => setForm((current) => ({ ...current, name: value }))}
                placeholder="Enter your full name"
                required
                value={form.name}
              />

              <Input
                autoCapitalize="none"
                autoCorrect={false}
                containerClassName="mt-4"
                keyboardType="email-address"
                label="Email"
                onChangeText={(value) => setForm((current) => ({ ...current, email: value }))}
                placeholder="you@example.com"
                required
                value={form.email}
              />

              <Input
                containerClassName="mt-4"
                keyboardType="phone-pad"
                label="Phone"
                onChangeText={(value) => setForm((current) => ({ ...current, phone: value }))}
                placeholder="10-digit mobile number"
                required
                value={form.phone}
              />

              <Input
                containerClassName="mt-4"
                label="Address Line 1"
                onChangeText={(value) => setForm((current) => ({ ...current, line1: value }))}
                placeholder="House no., street, area"
                required
                value={form.line1}
              />

              <Input
                containerClassName="mt-4"
                label="Address Line 2"
                onChangeText={(value) => setForm((current) => ({ ...current, line2: value }))}
                placeholder="Apartment, suite, landmark"
                value={form.line2}
              />

              <Input
                containerClassName="mt-4"
                label="City"
                onChangeText={(value) => setForm((current) => ({ ...current, city: value }))}
                placeholder="City"
                required
                value={form.city}
              />

              <View className="mt-4">
                <Text className="mb-2 text-[14px] font-medium" style={{ color: theme.colors.text }}>
                  State
                  <Text style={{ color: theme.colors.error }}>{' *'}</Text>
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setStatePickerOpen(true)}
                  style={{
                    alignItems: 'center',
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    borderRadius: 16,
                    borderWidth: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    minHeight: 52,
                    paddingHorizontal: 16,
                  }}
                >
                  <Text style={{ color: theme.colors.text, fontSize: 15 }}>{form.state}</Text>
                  <Ionicons color={theme.colors.textMuted} name="chevron-down" size={18} />
                </Pressable>
              </View>

              <Modal
                animationType="slide"
                onRequestClose={() => setStatePickerOpen(false)}
                transparent
                visible={statePickerOpen}
              >
                <Pressable
                  onPress={() => setStatePickerOpen(false)}
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.45)',
                    flex: 1,
                    justifyContent: 'flex-end',
                  }}
                >
                  <Pressable
                    onPress={(event) => event.stopPropagation()}
                    style={{
                      backgroundColor: theme.colors.background,
                      borderTopLeftRadius: 24,
                      borderTopRightRadius: 24,
                      maxHeight: '70%',
                      paddingBottom: 24,
                      paddingTop: 12,
                    }}
                  >
                    <Text
                      className="px-5 pb-3 text-[17px] font-semibold"
                      style={{ color: theme.colors.text }}
                    >
                      Select state
                    </Text>
                    <FlatList
                      data={INDIAN_STATES}
                      keyExtractor={(item) => item}
                      renderItem={({ item: stateName }) => (
                        <Pressable
                          onPress={() => {
                            setForm((current) => ({ ...current, state: stateName }));
                            setStatePickerOpen(false);
                          }}
                          style={{
                            backgroundColor:
                              form.state === stateName
                                ? theme.colors.surface
                                : 'transparent',
                            paddingHorizontal: 20,
                            paddingVertical: 14,
                          }}
                        >
                          <Text style={{ color: theme.colors.text, fontSize: 15 }}>
                            {stateName}
                          </Text>
                        </Pressable>
                      )}
                    />
                  </Pressable>
                </Pressable>
              </Modal>

              <Input
                containerClassName="mt-4"
                keyboardType="number-pad"
                label="Pincode"
                onChangeText={(value) => setForm((current) => ({ ...current, pincode: value }))}
                placeholder="6-digit pincode"
                required
                value={form.pincode}
              />

              {submitting ? (
                <View
                  className="mt-5 flex-row items-center gap-3 rounded-[18px] border px-4 py-3"
                  style={{
                    backgroundColor: `${theme.colors.primary}0D`,
                    borderColor: `${theme.colors.primary}22`,
                  }}
                >
                  <Ionicons color={theme.colors.primary} name="hourglass-outline" size={20} />
                  <Text className="flex-1 text-[14px] leading-6" style={{ color: theme.colors.text }}>
                    Please wait, we are submitting your order details…
                  </Text>
                </View>
              ) : null}

              {error ? (
                <Text className="mt-4 text-[14px] leading-6" style={{ color: theme.colors.error }}>
                  {error}
                </Text>
              ) : null}
            </Card>

            <Card className="mt-4 rounded-[26px]">
              <View className="flex-row items-start gap-3">
                <View
                  className="h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${theme.colors.success}18` }}
                >
                  <Ionicons color={theme.colors.success} name="cash-outline" size={22} />
                </View>

                <View className="flex-1">
                  <Text className="text-[16px] font-semibold" style={{ color: theme.colors.text }}>
                    Cash on Delivery
                  </Text>
                  <Text className="mt-1 text-[14px] leading-6" style={{ color: theme.colors.textMuted }}>
                    Pay when your order arrives. No online payment is required right now.
                  </Text>
                </View>
              </View>
            </Card>

            <Card className="mt-4 rounded-[26px]">
              <Text className="text-[20px] font-semibold" style={{ color: theme.colors.text }}>
                Order Summary
              </Text>

              <View className="mt-4 gap-4">
                {items.map((item) => (
                  <View key={item.id} className="flex-row items-center justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-[15px] font-semibold" style={{ color: theme.colors.text }}>
                        {item.name}
                      </Text>
                      <Text className="mt-1 text-[13px]" style={{ color: theme.colors.textMuted }}>
                        Qty {item.quantity}
                      </Text>
                    </View>
                    <Text className="text-[15px] font-semibold" style={{ color: theme.colors.primary }}>
                      {formatPrice(item.price * item.quantity)}
                    </Text>
                  </View>
                ))}
              </View>

              <View
                className="mt-5 border-t pt-4"
                style={{ borderColor: theme.colors.border }}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-[15px]" style={{ color: theme.colors.textMuted }}>
                    Items subtotal
                  </Text>
                  <Text className="text-[15px] font-semibold" style={{ color: theme.colors.text }}>
                    {formatPrice(total)}
                  </Text>
                </View>
                <View className="mt-3 flex-row items-center justify-between">
                  <Text className="text-[15px]" style={{ color: theme.colors.textMuted }}>
                    Delivery fee
                  </Text>
                  <Text className="text-[15px] font-semibold" style={{ color: theme.colors.text }}>
                    {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                  </Text>
                </View>
                {deliveryFee > 0 ? (
                  <Text className="mt-2 text-[12px]" style={{ color: theme.colors.textMuted }}>
                    Flat ₹29 delivery fee on every order
                  </Text>
                ) : null}
                <View className="mt-4 flex-row items-center justify-between">
                  <Text className="text-[15px] font-semibold" style={{ color: theme.colors.text }}>
                    Payable total
                  </Text>
                  <Text className="text-[22px] font-bold" style={{ color: theme.colors.primary }}>
                    {formatPrice(grandTotal)}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        </ScrollView>

        <SafeAreaView
          edges={['bottom']}
          style={{ backgroundColor: theme.colors.background }}
        >
          <View className="px-4 pb-4 pt-2">
            <Button
              disabled={submitting}
              loading={submitting}
              onPress={() => void handlePlaceOrder()}
              text={
                submitting
                  ? 'Please wait, submitting your details…'
                  : 'Place Order'
              }
            />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { api, getApiErrorMessage } from '../lib/api';
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

interface CheckoutPayload {
  id: string;
  customer_name: string;
  customer_email: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  landmark?: string | null;
  items: OrderItem[];
  total_amount: number;
  status: 'NEW';
}

interface CheckoutApiResponse {
  orderId?: string;
  id?: string;
  data?: {
    orderId?: string;
    id?: string;
  };
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
    image: item.image,
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

async function submitOrderViaApi(payload: CheckoutPayload): Promise<string> {
  const response = await api.post<CheckoutApiResponse | { success: boolean; data?: CheckoutApiResponse }>(
    '/orders',
    payload
  );
  const responseData = response.data as CheckoutApiResponse & {
    success?: boolean;
    data?: CheckoutApiResponse;
  };

  return (
    responseData.orderId ??
    responseData.id ??
    responseData.data?.orderId ??
    responseData.data?.id ??
    payload.id
  );
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
  const { isLoggedIn, updateUser, user } = useAuth();
  const [form, setForm] = useState<CheckoutFormState>(createDefaultFormState());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const deliveryFee = useMemo(() => (total >= 5000 || total === 0 ? 0 : 99), [total]);
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
    const payload: CheckoutPayload = {
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
      const placedOrderId = await submitOrderViaApi(payload);

      const address = createAddressFromForm(form);
      const order: Order = {
        id: placedOrderId,
        date: new Date().toISOString(),
        status: 'confirmed',
        items,
        total: grandTotal,
        address,
      };

      await persistOrderHistory(order);
      await setStorageItem(
        STORAGE_KEYS.guestCheckoutProfile,
        createStoredCheckoutProfile(form)
      ).catch(() => undefined);

      if (isLoggedIn) {
        await updateUser({
          name: form.name.trim(),
          phone: form.phone.trim(),
          defaultAddress: address,
        });
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
  }, [clear, form, grandTotal, isLoggedIn, items, orderItems, updateUser]);

  if (completedOrder) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
        <Header showCartButton={false} subtitle="Success" title="Order Confirmed" />
        <EmptyState
          ctaLabel="Continue Shopping"
          fullScreen
          iconName="checkmark-circle-outline"
          message={`Thank you for choosing Stree. Your order number is #${completedOrder.id.slice(0, 8).toUpperCase()}.`}
          onPressCta={() => router.replace('/products')}
          onPressSecondary={() => router.replace('/profile')}
          secondaryLabel="View Profile"
          title="Congratulations"
        />
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
            {!isLoggedIn ? (
              <Card className="mb-4 rounded-[22px]">
                <Text className="text-[16px] font-semibold" style={{ color: theme.colors.text }}>
                  Save this address with your Stree account.
                </Text>
                <Text className="mt-2 text-[14px] leading-6" style={{ color: theme.colors.textMuted }}>
                  Guest checkout works, and sign-in makes the next order faster by reusing your saved address and profile details.
                </Text>
                <Button
                  className="mt-4"
                  onPress={() => router.push('/auth/login?returnTo=%2Fcheckout')}
                  text="Login to Save Details"
                  variant="outline"
                />
              </Card>
            ) : null}

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
                value={form.email}
              />

              <Input
                containerClassName="mt-4"
                keyboardType="phone-pad"
                label="Phone"
                onChangeText={(value) => setForm((current) => ({ ...current, phone: value }))}
                placeholder="10-digit mobile number"
                value={form.phone}
              />

              <Input
                containerClassName="mt-4"
                label="Address Line 1"
                onChangeText={(value) => setForm((current) => ({ ...current, line1: value }))}
                placeholder="House no., street, area"
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
                value={form.city}
              />

              <Card className="mt-4 rounded-[20px]" padding="sm">
                <Text className="mb-2 text-[14px] font-medium" style={{ color: theme.colors.text }}>
                  State
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {INDIAN_STATES.map((stateName) => (
                    <Button
                      key={stateName}
                      fullWidth={false}
                      onPress={() => setForm((current) => ({ ...current, state: stateName }))}
                      size="sm"
                      text={stateName}
                      variant={form.state === stateName ? 'secondary' : 'ghost'}
                    />
                  ))}
                </View>
              </Card>

              <Input
                containerClassName="mt-4"
                keyboardType="number-pad"
                label="Pincode"
                onChangeText={(value) => setForm((current) => ({ ...current, pincode: value }))}
                placeholder="6-digit pincode"
                value={form.pincode}
              />

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
                    Items total
                  </Text>
                  <Text className="text-[15px] font-semibold" style={{ color: theme.colors.text }}>
                    {formatPrice(total)}
                  </Text>
                </View>
                <View className="mt-3 flex-row items-center justify-between">
                  <Text className="text-[15px]" style={{ color: theme.colors.textMuted }}>
                    Delivery
                  </Text>
                  <Text className="text-[15px] font-semibold" style={{ color: theme.colors.text }}>
                    {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                  </Text>
                </View>
                <View className="mt-4 flex-row items-center justify-between">
                  <Text className="text-[15px]" style={{ color: theme.colors.textMuted }}>
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
              loading={submitting}
              onPress={() => void handlePlaceOrder()}
              text="Place Order"
            />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

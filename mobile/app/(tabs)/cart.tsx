import React, { useMemo } from 'react';
import {
  FlatList,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useCart } from '../../hooks/useCart';
import { getTheme } from '../../lib/theme';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import CartItem from '../../components/common/CartItem';
import EmptyState from '../../components/common/EmptyState';
import Header from '../../components/common/Header';
import BrandLoader from '../../components/common/BrandLoader';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatPrice } from '../../components/common/PriceTag';

/**
 * Renders the shopping cart screen with line items and a sticky order summary.
 */
export default function CartScreen(): React.JSX.Element {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const { clear, hydrated, items, remove, total, update } = useCart();

  const deliveryFee = useMemo(() => (total >= 5000 || total === 0 ? 0 : 99), [total]);
  const grandTotal = total + deliveryFee;

  if (!hydrated) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
        <Header showCartButton={false} subtitle="Bag" title="Shopping Cart" />
        <View className="flex-1 px-4 pt-4">
          <BrandLoader caption="Getting your saved cart ready." label="Loading your cart" />
          <LoadingSkeleton count={2} variant="cart" />
        </View>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
        <Header showCartButton={false} subtitle="Bag" title="Shopping Cart" />
        <EmptyState
          ctaLabel="Continue Shopping"
          fullScreen
          message="Your wardrobe is waiting. Add a few sarees to begin your order."
          onPressCta={() => router.push('/products')}
          title="Your cart is empty"
        />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <Header showCartButton={false} subtitle="Bag" title="Shopping Cart" />

      <FlatList
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20, paddingTop: 8, gap: 12 }}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onDecrease={(cartItem) => update(cartItem.id, cartItem.quantity - 1)}
            onIncrease={(cartItem) => update(cartItem.id, cartItem.quantity + 1)}
            onRemove={(cartItem) => remove(cartItem.id)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      <SafeAreaView
        edges={['bottom']}
        style={{ backgroundColor: theme.colors.background }}
      >
        <Card className="mx-4 mb-4 rounded-[24px] px-5 py-5">
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-[15px]" style={{ color: theme.colors.textMuted }}>
                Subtotal
              </Text>
              <Text className="text-[15px] font-semibold" style={{ color: theme.colors.text }}>
                {formatPrice(total)}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-[15px]" style={{ color: theme.colors.textMuted }}>
                Delivery
              </Text>
              <Text className="text-[15px] font-semibold" style={{ color: theme.colors.text }}>
                {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
              </Text>
            </View>

            <View
              className="mt-1 flex-row items-center justify-between border-t pt-4"
              style={{ borderColor: theme.colors.border }}
            >
              <Text className="text-[18px] font-semibold" style={{ color: theme.colors.text }}>
                Total
              </Text>
              <Text className="text-[22px] font-bold" style={{ color: theme.colors.primary }}>
                {formatPrice(grandTotal)}
              </Text>
            </View>

            <Button
              className="mt-2"
              onPress={() => router.push('/checkout')}
              text="Proceed to Checkout"
            />

            <Button
              onPress={clear}
              text="Clear Cart"
              variant="ghost"
            />
          </View>
        </Card>
      </SafeAreaView>
    </View>
  );
}

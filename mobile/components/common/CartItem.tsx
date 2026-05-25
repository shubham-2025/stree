import React from 'react';
import { Pressable, Text, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import type { CartItem as CartProduct } from '../../lib/types';
import { getTheme } from '../../lib/theme';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { PriceTag } from './PriceTag';

const IMAGE_BLURHASH = 'L6Pj0^#*0M-V~q^+M{Rj9Fj]~qxu';

export interface CartItemProps {
  item: CartProduct;
  onIncrease: (item: CartProduct) => void;
  onDecrease: (item: CartProduct) => void;
  onRemove: (item: CartProduct) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Renders a cart row with quantity controls, pricing, and remove action.
 */
export function CartItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  className,
  disabled = false,
}: CartItemProps): React.JSX.Element {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const imageSource = item.image || item.images[0] || undefined;
  const canDecrease = item.quantity > 1 && !disabled;

  return (
    <Card className={['p-0', className].filter(Boolean).join(' ')} padding="none">
      <View className="flex-row gap-4 p-4">
        <Image
          cachePolicy="memory-disk"
          contentFit="cover"
          placeholder={{ blurhash: IMAGE_BLURHASH }}
          recyclingKey={item.id}
          source={imageSource ? { uri: imageSource } : undefined}
          style={{
            width: 78,
            height: 104,
            borderRadius: 18,
            backgroundColor: theme.colors.border,
          }}
          transition={0}
        />

        <View className="flex-1 justify-between">
          <View className="pr-8">
            <Text
              className="text-[15px] font-semibold leading-6"
              numberOfLines={2}
              style={{ color: theme.colors.text }}
            >
              {item.name}
            </Text>
            <Text
              className="mt-1 text-[12px] font-medium uppercase tracking-[0.5px]"
              style={{ color: theme.colors.textMuted }}
            >
              {item.category}
            </Text>

            <View className="mt-2 flex-row flex-wrap gap-2">
              <Badge text={item.fabric} variant="secondary" />
            </View>
          </View>

          <View className="mt-4 flex-row items-end justify-between gap-3">
            <PriceTag size="md" value={item.price} />

            <View
              className="flex-row items-center rounded-full border px-1 py-1"
              style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}
            >
              <Pressable
                accessibilityLabel="Decrease quantity"
                accessibilityRole="button"
                className="h-9 w-9 items-center justify-center rounded-[12px]"
                disabled={!canDecrease}
                onPress={() => onDecrease(item)}
                style={({ pressed }) => ({
                  backgroundColor: pressed && canDecrease ? `${theme.colors.primary}12` : 'transparent',
                  opacity: !canDecrease ? 0.35 : pressed ? 0.8 : 1,
                })}
              >
                <Ionicons color={theme.colors.text} name="remove" size={18} />
              </Pressable>

              <Text
                className="min-w-[28px] text-center text-[15px] font-semibold"
                style={{ color: theme.colors.text }}
              >
                {item.quantity}
              </Text>

              <Pressable
                accessibilityLabel="Increase quantity"
                accessibilityRole="button"
                className="h-9 w-9 items-center justify-center rounded-[12px]"
                disabled={disabled}
                onPress={() => onIncrease(item)}
                style={({ pressed }) => ({
                  backgroundColor: pressed && !disabled ? `${theme.colors.primary}12` : 'transparent',
                  opacity: disabled ? 0.35 : pressed ? 0.8 : 1,
                })}
              >
                <Ionicons color={theme.colors.text} name="add" size={18} />
              </Pressable>
            </View>
          </View>
        </View>

        <Pressable
          accessibilityLabel="Remove item"
          accessibilityRole="button"
          className="absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full"
          disabled={disabled}
          onPress={() => onRemove(item)}
          style={({ pressed }) => ({
            backgroundColor: theme.isDark ? 'rgba(59, 50, 46, 0.9)' : 'rgba(123, 30, 58, 0.08)',
            opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          })}
        >
          <Ionicons color={theme.colors.primary} name="trash-outline" size={18} />
        </Pressable>
      </View>
    </Card>
  );
}

export default CartItem;

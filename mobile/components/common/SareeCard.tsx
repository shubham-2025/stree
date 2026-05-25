import React, { memo } from 'react';
import { Pressable, Text, View, useColorScheme, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import type { Product } from '../../lib/types';
import { getTheme } from '../../lib/theme';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { PriceTag } from './PriceTag';

const IMAGE_BLURHASH = 'L6Pj0^#*0M-V~q^+M{Rj9Fj]~qxu';

export interface SareeCardProps {
  product: Product;
  isFavorite?: boolean;
  onPress?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  className?: string;
}

function getSupportingNote(product: Product): string {
  if (product.reviews > 0 && product.rating > 0) {
    return `${product.rating.toFixed(1)} rating | ${product.reviews} reviews`;
  }

  return 'Fresh arrival | Awaiting first review';
}

/**
 * Renders a tappable product card tuned for narrow mobile widths.
 */
function SareeCardComponent({
  product,
  isFavorite = false,
  onPress,
  onToggleWishlist,
  className,
}: SareeCardProps): React.JSX.Element {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const imageSource = product.image || product.images[0] || undefined;
  const isCompactLayout = width < 390;

  return (
    <View className={['relative', className].filter(Boolean).join(' ')}>
      <Pressable
        accessibilityLabel={`View ${product.name}`}
        accessibilityRole="button"
        onPress={() => {
          onPress?.(product);
          router.push(`/product/${product.id}`);
        }}
        style={({ pressed }) => ({
          opacity: pressed ? 0.97 : 1,
          transform: [{ scale: pressed ? 0.995 : 1 }],
        })}
      >
        <Card className="overflow-hidden p-0" padding="none">
          <View className="flex-row gap-3 p-3.5">
            <View className="relative">
              <Image
                cachePolicy="memory-disk"
                contentFit="cover"
                placeholder={{ blurhash: IMAGE_BLURHASH }}
                recyclingKey={product.id}
                source={imageSource ? { uri: imageSource } : undefined}
                style={{
                  width: isCompactLayout ? 96 : 112,
                  height: isCompactLayout ? 132 : 148,
                  borderRadius: 18,
                  backgroundColor: theme.colors.border,
                }}
                transition={0}
              />

              <View className="absolute left-2 top-2 gap-2">
                {product.mrp && product.mrp > product.price ? (
                  <Badge text="Sale" variant="sale" />
                ) : null}
              </View>
            </View>

            <View className="flex-1" style={{ minWidth: 0, paddingRight: 38 }}>
              <Text
                className="text-[14px] font-semibold leading-6"
                numberOfLines={2}
                style={{ color: theme.colors.text }}
              >
                {product.name}
              </Text>

              <Text
                className="mt-1 text-[11px] font-semibold uppercase"
                numberOfLines={1}
                style={{ color: theme.colors.textMuted, letterSpacing: 0.5 }}
              >
                {`${product.category} | ${product.fabric}`}
              </Text>

              <Text
                className="mt-2 text-[13px] leading-5"
                numberOfLines={2}
                style={{ color: theme.colors.textMuted }}
              >
                {product.description || 'Handpicked saree for elegant day and festive wear.'}
              </Text>

              <View className="mt-3 flex-row flex-wrap gap-2">
                <Badge text={product.occasion} variant="primary" />
                <Badge
                  text={product.inStock ? 'Ready to ship' : 'Sold out'}
                  variant={product.inStock ? 'success' : 'outline'}
                />
              </View>

              <View className="mt-4">
                <PriceTag mrp={product.mrp} size="md" value={product.price} />
                <Text className="mt-2 text-[12px]" style={{ color: theme.colors.textMuted }}>
                  {getSupportingNote(product)}
                </Text>
                <Text className="mt-2 text-[12px] font-semibold" style={{ color: theme.colors.primary }}>
                  View details
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </Pressable>

      <Pressable
        accessibilityLabel={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
        accessibilityRole="button"
        className="absolute right-3 top-3 h-10 w-10 items-center justify-center rounded-[14px]"
        onPress={() => onToggleWishlist?.(product)}
        style={({ pressed }) => ({
          backgroundColor: isFavorite
            ? theme.colors.secondary
            : pressed
              ? 'rgba(123, 30, 58, 0.08)'
              : theme.isDark
                ? 'rgba(22, 20, 18, 0.84)'
                : 'rgba(255, 255, 255, 0.98)',
          borderColor: isFavorite ? theme.colors.secondary : theme.colors.border,
          borderWidth: 1,
        })}
      >
        <Ionicons
          color={isFavorite ? '#2C2C2C' : theme.colors.primary}
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={19}
        />
      </Pressable>
    </View>
  );
}

/**
 * Memoized catalogue card to reduce unnecessary re-renders in product grids.
 */
export const SareeCard = memo(SareeCardComponent);

export default SareeCard;

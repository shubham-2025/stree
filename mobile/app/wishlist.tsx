import React, { useMemo } from 'react';
import { Text, View, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

import Header from '../components/common/Header';
import SareeGrid from '../components/common/SareeGrid';
import BrandLoader from '../components/common/BrandLoader';
import Card from '../components/ui/Card';
import { useWishlist } from '../hooks/useWishlist';
import { getTheme } from '../lib/theme';

/**
 * Renders the saved wishlist catalogue linked from the profile area.
 */
export default function WishlistScreen(): React.JSX.Element {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const { count, favorites, hydrated, isFavorite, items, toggle } = useWishlist();

  const orderedItems = useMemo(() => {
    const itemsById = new Map(items.map((item) => [item.id, item]));
    return favorites
      .map((favoriteId) => itemsById.get(favoriteId))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [favorites, items]);

  if (!hydrated) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
        <Header showBackButton showCartButton={false} subtitle="Account" title="Wishlist" />
        <BrandLoader
          caption="Gathering the sarees you saved for later."
          fullScreen
          label="Loading your wishlist"
        />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <Header showBackButton showCartButton={false} subtitle="Account" title="Wishlist" />

      <SareeGrid
        ListHeaderComponent={
          <View className="px-4 pb-4 pt-4">
            <Card className="rounded-[24px]">
              <Text className="text-[21px] font-semibold" style={{ color: theme.colors.text }}>
                Saved favourites
              </Text>
              <Text
                className="mt-2 text-[14px] leading-6"
                style={{ color: theme.colors.textMuted }}
              >
                {count > 0
                  ? `${count} saved style${count === 1 ? '' : 's'} ready for your next look.`
                  : 'Tap the heart on any product and it will appear here.'}
              </Text>
            </Card>
          </View>
        }
        emptyActionLabel="Browse Sarees"
        emptyMessage="Your saved styles will stay here so you can revisit them quickly."
        emptyTitle="No favourites yet"
        isFavorite={isFavorite}
        onPressEmptyAction={() => router.push('/products')}
        onToggleWishlist={(product) => toggle(product)}
        products={orderedItems}
      />
    </View>
  );
}

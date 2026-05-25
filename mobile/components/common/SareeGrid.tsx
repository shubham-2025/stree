import React from 'react';
import { FlatList, View, type FlatListProps } from 'react-native';

import type { Product } from '../../lib/types';
import EmptyState from './EmptyState';
import LoadingSkeleton from './LoadingSkeleton';
import SareeCard from './SareeCard';

export interface SareeGridProps
  extends Omit<
    FlatListProps<Product>,
    'data' | 'renderItem' | 'keyExtractor' | 'numColumns' | 'columnWrapperStyle'
  > {
  products: Product[];
  loading?: boolean;
  isFavorite?: (productId: string) => boolean;
  onPressProduct?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyActionLabel?: string;
  onPressEmptyAction?: () => void;
}

/**
 * Renders the standard Stree product list with loading and empty states.
 */
export function SareeGrid({
  products,
  loading = false,
  isFavorite,
  onPressProduct,
  onToggleWishlist,
  emptyTitle = 'No sarees found',
  emptyMessage = 'Try a different category or search to discover new drapes.',
  emptyActionLabel,
  onPressEmptyAction,
  contentContainerStyle,
  ...flatListProps
}: SareeGridProps): React.JSX.Element {
  if (loading && products.length === 0) {
    return <LoadingSkeleton count={4} variant="list" />;
  }

  return (
    <FlatList
      contentContainerStyle={[
        { paddingBottom: 24 },
        products.length === 0 ? { flexGrow: 1 } : null,
        contentContainerStyle,
      ]}
      data={products}
      keyExtractor={(item) => item.id}
      initialNumToRender={5}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      maxToRenderPerBatch={5}
      removeClippedSubviews={false}
      renderItem={({ item }) => (
        <View style={{ paddingHorizontal: 16 }}>
          <SareeCard
            isFavorite={isFavorite?.(item.id)}
            onPress={onPressProduct}
            onToggleWishlist={onToggleWishlist}
            product={item}
          />
        </View>
      )}
      showsVerticalScrollIndicator={false}
      windowSize={5}
      ListEmptyComponent={
        !loading ? (
          <EmptyState
            fullScreen
            iconName="search-outline"
            message={emptyMessage}
            onPressCta={onPressEmptyAction}
            title={emptyTitle}
            ctaLabel={emptyActionLabel}
          />
        ) : null
      }
      {...flatListProps}
    />
  );
}

export default SareeGrid;

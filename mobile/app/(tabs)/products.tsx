import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { PRODUCT_FILTERS } from '../../constants/Categories';
import { useCart } from '../../hooks/useCart';
import { useProducts } from '../../hooks/useProducts';
import { useWishlist } from '../../hooks/useWishlist';
import { fetchHomeCategories } from '../../lib/api';
import { getTheme } from '../../lib/theme';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import CategoryChip from '../../components/common/CategoryChip';
import Header from '../../components/common/Header';
import SareeGrid from '../../components/common/SareeGrid';

function resolveInitialFilter(categoryParam?: string): string {
  return typeof categoryParam === 'string' && categoryParam.trim().length > 0
    ? categoryParam.trim()
    : 'All';
}

/**
 * Renders the browse and search screen for the Stree catalogue.
 */
export default function ProductsScreen(): React.JSX.Element {
  const params = useLocalSearchParams<{ category?: string }>();
  const routeCategory = Array.isArray(params.category) ? params.category[0] : params.category;
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const { count } = useCart();
  const { isFavorite, toggle } = useWishlist();
  const [search, setSearch] = useState<string>('');
  const [managedCategories, setManagedCategories] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>(resolveInitialFilter(routeCategory));
  const deferredSearch = useDeferredValue(search);
  const { data, error, hasMore, loadMore, loading, loadingMore, refreshing, refetch, setFilters } =
    useProducts({
      category: activeFilter !== 'All' && activeFilter !== 'Sale' ? activeFilter : undefined,
      limit: 12,
      search: deferredSearch.trim() || undefined,
    });

  useEffect(() => {
    let isMounted = true;

    const loadManagedCategories = async (): Promise<void> => {
      try {
        const categories = await fetchHomeCategories();

        if (isMounted) {
          setManagedCategories(categories.map((category) => category.name));
        }
      } catch {
        if (isMounted) {
          setManagedCategories([]);
        }
      }
    };

    void loadManagedCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setActiveFilter(resolveInitialFilter(routeCategory));
  }, [routeCategory]);

  useEffect(() => {
    setFilters({
      category:
        activeFilter !== 'All' && activeFilter !== 'Sale' ? activeFilter : undefined,
      search: deferredSearch.trim() || undefined,
    });
  }, [activeFilter, deferredSearch, setFilters]);

  const filterOptions = useMemo(
    () =>
      Array.from(
        new Set([
          ...PRODUCT_FILTERS,
          ...managedCategories,
          ...data.map((product) => product.category).filter(Boolean),
          ...(activeFilter !== 'All' && activeFilter !== 'Sale' ? [activeFilter] : []),
        ])
      ),
    [activeFilter, data, managedCategories]
  );

  const displayedProducts = useMemo(
    () =>
      activeFilter === 'Sale'
        ? data.filter((product) => Boolean(product.mrp && product.mrp > product.price))
        : data,
    [activeFilter, data]
  );

  const filterSection = (
    <View className="px-4 pt-4">
      <Input
        autoCapitalize="none"
        autoCorrect={false}
        containerClassName="mb-4"
        leftIcon={<Ionicons color={theme.colors.textMuted} name="search-outline" size={18} />}
        onChangeText={setSearch}
        placeholder="Search sarees, fabrics, occasions"
        returnKeyType="search"
        value={search}
      />

      <View className="flex-row flex-wrap gap-3">
        {filterOptions.map((filterLabel) => (
          <CategoryChip
            key={filterLabel}
            active={activeFilter === filterLabel}
            label={filterLabel}
            onPress={() => setActiveFilter(filterLabel)}
          />
        ))}
      </View>

      <View className="pb-4 pt-5">
        <Text className="text-[22px] font-semibold" style={{ color: theme.colors.text }}>
          Saree Collection
        </Text>
        <Text className="mt-1 text-[14px]" style={{ color: theme.colors.textMuted }}>
          Search, filter, and browse a clean one-by-one catalogue built for mobile scanning.
        </Text>
        <Text className="mt-3 text-[13px] font-semibold" style={{ color: theme.colors.primary }}>
          {displayedProducts.length} style{displayedProducts.length === 1 ? '' : 's'} visible
        </Text>
      </View>

      {error && displayedProducts.length === 0 && !loading ? (
        <Card className="mb-4">
          <Text className="text-[15px] font-medium" style={{ color: theme.colors.text }}>
            We could not load the catalogue.
          </Text>
          <Text className="mt-2 text-[14px] leading-6" style={{ color: theme.colors.textMuted }}>
            {error}
          </Text>
          <Button className="mt-4" onPress={() => void refetch()} text="Try Again" />
        </Card>
      ) : null}
    </View>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <Header
        cartCount={count}
        showCartButton={false}
        showProfileButton
        subtitle="Catalogue"
        title="Browse Sarees"
      />

      <SareeGrid
        ListFooterComponent={
          loadingMore ? (
            <View className="items-center pb-8 pt-2">
              <ActivityIndicator color={theme.colors.primary} />
              <Text className="mt-3 text-[13px]" style={{ color: theme.colors.textMuted }}>
                Loading more styles...
              </Text>
            </View>
          ) : !hasMore && displayedProducts.length > 0 ? (
            <View className="items-center pb-8 pt-2">
              <Text className="text-[13px]" style={{ color: theme.colors.textMuted }}>
                You have reached the end of the collection.
              </Text>
            </View>
          ) : null
        }
        ListHeaderComponent={filterSection}
        contentContainerStyle={{ paddingBottom: 16 }}
        emptyActionLabel="Clear Filters"
        emptyMessage="Try widening your search or switching to another category."
        emptyTitle="No sarees match these filters"
        isFavorite={isFavorite}
        loading={loading}
        onEndReached={() => void loadMore()}
        onEndReachedThreshold={0.45}
        onPressEmptyAction={() => {
          setSearch('');
          setActiveFilter('All');
        }}
        onToggleWishlist={(product) => toggle(product)}
        products={displayedProducts}
        refreshControl={
          <RefreshControl
            onRefresh={() => void refetch()}
            refreshing={refreshing}
            tintColor={theme.colors.primary}
          />
        }
      />
    </View>
  );
}

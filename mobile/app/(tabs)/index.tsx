import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { CATEGORIES } from '../../constants/Categories';
import { useCart } from '../../hooks/useCart';
import { useProducts } from '../../hooks/useProducts';
import { useWishlist } from '../../hooks/useWishlist';
import { getTheme } from '../../lib/theme';
import type { Product } from '../../lib/types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import CategoryChip from '../../components/common/CategoryChip';
import Header from '../../components/common/Header';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SareeCard from '../../components/common/SareeCard';
import SareeGrid from '../../components/common/SareeGrid';
import { PriceTag } from '../../components/common/PriceTag';

const HERO_BLURHASH = 'L6Pj0^#*0M-V~q^+M{Rj9Fj]~qxu';
type CategoryKey = (typeof CATEGORIES)[number];
type CategoryHighlight = {
  category: CategoryKey;
  product: Product;
  eyebrow: string;
  title: string;
  description: string;
  overlay: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

const CATEGORY_STORY: Record<
  CategoryKey,
  {
    eyebrow: string;
    title: string;
    description: string;
    overlay: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
  }
> = {
  Silk: {
    eyebrow: 'Silk Edit',
    title: 'Soft sheen with festive confidence',
    description: 'Polished drapes for events, gifting, and elevated daywear.',
    overlay: 'rgba(86, 56, 23, 0.34)',
    icon: 'diamond-outline',
  },
  Cotton: {
    eyebrow: 'Everyday Ease',
    title: 'Lightweight comfort for repeat wear',
    description: 'Breathable sarees that still feel considered and premium.',
    overlay: 'rgba(31, 70, 48, 0.34)',
    icon: 'leaf-outline',
  },
  Designer: {
    eyebrow: 'Designer Picks',
    title: 'Sharper looks with statement detailing',
    description: 'Fashion-first drapes built for compliments and occasions.',
    overlay: 'rgba(61, 36, 72, 0.34)',
    icon: 'sparkles-outline',
  },
  Bridal: {
    eyebrow: 'Wedding Edit',
    title: 'Ceremony-ready drapes with richer character',
    description: 'Luminous tones and occasion-first silhouettes for milestone moments.',
    overlay: 'rgba(91, 24, 44, 0.4)',
    icon: 'rose-outline',
  },
  Seasonal: {
    eyebrow: 'Fresh Drops',
    title: 'New arrivals curated for what shoppers want now',
    description: 'Timely edits that keep the collection feeling fresh and alive.',
    overlay: 'rgba(98, 62, 22, 0.32)',
    icon: 'sunny-outline',
  },
};

function sortBestsellers(products: Product[]): Product[] {
  return [...products]
    .sort((left, right) => {
      const scoreDifference =
        right.rating * 10 + right.reviews - (left.rating * 10 + left.reviews);

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return right.price - left.price;
    })
    .slice(0, 8);
}

function findCategoryProduct(products: Product[], category: string): Product | null {
  const normalized = category.toLowerCase();

  return (
    products.find((product) =>
      [product.name, product.category, product.fabric, product.occasion, product.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    ) ??
    products.find((product) => product.category.toLowerCase().includes(normalized)) ??
    products[0] ??
    null
  );
}

function buildCategoryHighlights(products: Product[]): CategoryHighlight[] {
  return CATEGORIES.reduce<CategoryHighlight[]>((highlights, category) => {
    const product = findCategoryProduct(products, category);

    if (!product) {
      return highlights;
    }

    highlights.push({
      category,
      product,
      ...CATEGORY_STORY[category],
    });

    return highlights;
  }, []);
}

/**
 * Renders the Stree home screen with a product-led hero slider, horizontal category discovery, and stacked catalogue cards.
 */
export default function HomeScreen(): React.JSX.Element {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const { count } = useCart();
  const { isFavorite, toggle } = useWishlist();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [heroIndex, setHeroIndex] = useState<number>(0);
  const heroScrollRef = useRef<ScrollView | null>(null);
  const { data, error, loading, refreshing, refetch, setFilters } = useProducts({
    limit: 12,
  });

  useEffect(() => {
    setFilters({
      category: selectedCategory,
    });
  }, [selectedCategory, setFilters]);

  const newArrivals = useMemo(() => data.slice(0, 4), [data]);
  const bestsellers = useMemo(() => sortBestsellers(data), [data]);
  const heroSlides = useMemo(() => (data.length > 0 ? data.slice(0, 4) : []), [data]);
  const categoryHighlights = useMemo(() => buildCategoryHighlights(data), [data]);
  const heroCardWidth = width - 32;
  const featuredCategory = categoryHighlights[0] ?? null;
  const secondaryCategoryHighlights = categoryHighlights.slice(1, 5);
  const secondaryCategoryCardWidth = (width - 32 - 12) / 2;

  useEffect(() => {
    if (heroSlides.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setHeroIndex((currentIndex) => {
        const nextIndex = (currentIndex + 1) % heroSlides.length;
        heroScrollRef.current?.scrollTo({
          x: nextIndex * (width - 32),
          animated: true,
        });
        return nextIndex;
      });
    }, 3600);

    return () => {
      clearInterval(interval);
    };
  }, [heroSlides.length, width]);

  const handleCategoryPress = (category: string): void => {
    setSelectedCategory((currentCategory) =>
      currentCategory === category ? undefined : category
    );
  };

  const sectionHeader = (
    title: string,
    subtitle: string,
    onPressAction: () => void
  ) => (
    <View className="mb-4 px-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 pr-3">
          <Text className="text-[22px] font-semibold" style={{ color: theme.colors.text }}>
            {title}
          </Text>
          <Text className="mt-1 text-[14px] leading-6" style={{ color: theme.colors.textMuted }}>
            {subtitle}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          className="self-center rounded-full px-4 py-2"
          onPress={onPressAction}
          style={({ pressed }) => ({
            backgroundColor: pressed ? `${theme.colors.primary}10` : theme.colors.surface,
            borderColor: theme.colors.border,
            borderWidth: 1,
          })}
        >
          <Text className="text-[13px] font-semibold" style={{ color: theme.colors.primary }}>
            See all
          </Text>
        </Pressable>
      </View>
    </View>
  );

  const heroSection =
    heroSlides.length > 0 ? (
      <View className="px-4 pt-4">
        <ScrollView
          ref={heroScrollRef}
          horizontal
          onMomentumScrollEnd={(event) => {
            const nextIndex = Math.round(
              event.nativeEvent.contentOffset.x / heroCardWidth
            );
            setHeroIndex(nextIndex);
          }}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
        >
          {heroSlides.map((product) => (
            <Pressable
              key={product.id}
              accessibilityRole="button"
              onPress={() => router.push(`/product/${product.id}`)}
              style={({ pressed }) => ({
                width: heroCardWidth,
                opacity: pressed ? 0.98 : 1,
              })}
            >
              <Card
                className="overflow-hidden rounded-[30px] p-0"
                padding="none"
                style={{ width: heroCardWidth }}
              >
                <View className="relative" style={{ height: 380 }}>
                  <Image
                    contentFit="cover"
                    placeholder={{ blurhash: HERO_BLURHASH }}
                    source={product.image ? { uri: product.image } : undefined}
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: theme.colors.border,
                    }}
                    transition={0}
                  />

                  <View
                    className="absolute inset-0"
                    style={{ backgroundColor: 'rgba(21, 17, 15, 0.34)' }}
                  />

                  <View className="absolute inset-x-0 bottom-0 p-6">
                    <Text className="text-[12px] font-semibold uppercase text-white/86">
                      Storytelling
                    </Text>
                    <Text className="mt-3 text-[28px] font-semibold leading-9 text-white">
                      Drapes for celebrations, gifting, and elegant daywear.
                    </Text>
                    <Text className="mt-3 text-[15px] leading-6 text-white/86">
                      Browse premium sarees in a calmer, more crafted shopping flow with quick
                      discovery and confident checkout.
                    </Text>

                    <View className="mt-4 flex-row flex-wrap gap-2">
                      {[
                        { label: 'Curated edits', icon: 'sparkles-outline' as const },
                        { label: 'COD ready', icon: 'bag-check-outline' as const },
                        { label: 'Wishlist saved', icon: 'heart-outline' as const },
                      ].map((item) => (
                        <View
                          key={item.label}
                          className="flex-row items-center gap-2 rounded-full px-3 py-2"
                          style={{ backgroundColor: 'rgba(255, 255, 255, 0.14)' }}
                        >
                          <Ionicons color="#FFFFFF" name={item.icon} size={14} />
                          <Text className="text-[12px] font-medium text-white">{item.label}</Text>
                        </View>
                      ))}
                    </View>

                    <View className="mt-5 flex-row items-center justify-between">
                      <View className="flex-1 pr-4">
                        <Text
                          className="text-[17px] font-semibold text-white"
                          numberOfLines={1}
                        >
                          {product.name}
                        </Text>
                        <Text className="mt-1 text-[13px] text-white/78">
                          {product.category} | {product.fabric}
                        </Text>
                      </View>

                      <View
                        className="rounded-[18px] px-4 py-3"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.94)' }}
                      >
                        <PriceTag mrp={product.mrp} size="sm" value={product.price} />
                        <Text className="mt-1 text-[12px] font-semibold" style={{ color: theme.colors.primary }}>
                          Shop now
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Card>
            </Pressable>
          ))}
        </ScrollView>

        {heroSlides.length > 1 ? (
          <View className="mt-4 flex-row items-center justify-center gap-2">
            {heroSlides.map((slide, index) => (
              <View
                key={`${slide.id}-indicator`}
                className="h-2 rounded-full"
                style={{
                  width: heroIndex === index ? 22 : 8,
                  backgroundColor:
                    heroIndex === index ? theme.colors.primary : theme.colors.border,
                }}
              />
            ))}
          </View>
        ) : null}
      </View>
    ) : null;

  const serviceSection = (
    <View className="px-4 pt-5">
      <View className="gap-3">
        {[
          {
            title: 'Curated drops',
            message: 'Less clutter, stronger product focus.',
            icon: 'sparkles-outline' as const,
          },
          {
            title: 'Bag + wishlist persist',
            message: 'Come back and keep browsing where you left off.',
            icon: 'heart-outline' as const,
          },
          {
            title: 'Fast checkout',
            message: 'Simple COD-first flow tuned for mobile shoppers.',
            icon: 'bag-check-outline' as const,
          },
        ].map((item) => (
          <Card key={item.title} className="rounded-[24px]">
            <View className="flex-row items-start gap-4">
              <View
                className="h-12 w-12 items-center justify-center rounded-[16px]"
                style={{ backgroundColor: `${theme.colors.primary}10` }}
              >
                <Ionicons color={theme.colors.primary} name={item.icon} size={20} />
              </View>
              <View className="flex-1">
                <Text className="text-[16px] font-semibold" style={{ color: theme.colors.text }}>
                  {item.title}
                </Text>
                <Text className="mt-2 text-[13px] leading-6" style={{ color: theme.colors.textMuted }}>
                  {item.message}
                </Text>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </View>
  );

  const categorySection = (
    <View className="pt-8">
      <View className="px-4">
        <Text className="text-[22px] font-semibold" style={{ color: theme.colors.text }}>
          Browse by Category
        </Text>
        <Text className="mt-2 text-[14px] leading-6" style={{ color: theme.colors.textMuted }}>
          Start with the mood or weave you have in mind, then jump into the full catalogue.
        </Text>
      </View>

      {featuredCategory ? (
        <View className="px-4 pt-5">
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              handleCategoryPress(featuredCategory.category);
              router.push({
                pathname: '/products',
                params: { category: featuredCategory.category },
              });
            }}
            style={({ pressed }) => ({
              opacity: pressed ? 0.97 : 1,
            })}
          >
            <Card
              className="overflow-hidden rounded-[28px] p-0"
              padding="none"
              style={{ width: heroCardWidth }}
            >
              <View className="relative" style={{ height: 250 }}>
                <Image
                  contentFit="cover"
                  placeholder={{ blurhash: HERO_BLURHASH }}
                  source={featuredCategory.product.image ? { uri: featuredCategory.product.image } : undefined}
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: theme.colors.border,
                  }}
                  transition={0}
                />

                <View
                  className="absolute inset-0 justify-end p-6"
                  style={{ backgroundColor: featuredCategory.overlay }}
                >
                  <View className="mb-3 flex-row items-center gap-2">
                    <Ionicons color="#FFFFFF" name={featuredCategory.icon} size={16} />
                    <Text className="text-[12px] font-semibold uppercase text-white/88">
                      {featuredCategory.eyebrow}
                    </Text>
                  </View>
                  <Text className="text-[22px] font-semibold leading-8 text-white">
                    {featuredCategory.title}
                  </Text>
                  <Text className="mt-2 text-[14px] leading-6 text-white/84">
                    {featuredCategory.description}
                  </Text>
                </View>
              </View>
            </Card>
          </Pressable>
        </View>
      ) : null}

      {secondaryCategoryHighlights.length > 0 ? (
        <View className="flex-row flex-wrap justify-between gap-y-3 px-4 pt-4">
          {secondaryCategoryHighlights.map((item) => (
            <Pressable
              key={item.category}
              accessibilityRole="button"
              onPress={() => {
                handleCategoryPress(item.category);
                router.push({
                  pathname: '/products',
                  params: { category: item.category },
                });
              }}
              style={({ pressed }) => ({
                width: secondaryCategoryCardWidth,
                opacity: pressed ? 0.97 : 1,
              })}
            >
              <Card
                className="overflow-hidden rounded-[24px] p-0"
                padding="none"
                style={{ width: secondaryCategoryCardWidth }}
              >
                <View className="relative" style={{ height: 178 }}>
                  <Image
                    contentFit="cover"
                    placeholder={{ blurhash: HERO_BLURHASH }}
                    source={item.product.image ? { uri: item.product.image } : undefined}
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: theme.colors.border,
                    }}
                    transition={0}
                  />

                  <View
                    className="absolute inset-0 justify-end p-4"
                    style={{ backgroundColor: item.overlay }}
                  >
                    <Text className="text-[11px] font-semibold uppercase text-white/88">
                      {item.eyebrow}
                    </Text>
                    <Text className="mt-2 text-[16px] font-semibold leading-6 text-white">
                      {item.category}
                    </Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View className="px-4 pt-4">
        <Card className="rounded-[24px]">
          <Text className="text-[15px] font-semibold" style={{ color: theme.colors.text }}>
            Quick category filters
          </Text>
          <View className="mt-4 flex-row flex-wrap gap-3">
            {CATEGORIES.map((category) => (
              <CategoryChip
                key={category}
                active={selectedCategory === category}
                label={category}
                onPress={() => handleCategoryPress(category)}
              />
            ))}
          </View>
        </Card>
      </View>
    </View>
  );

  const listHeader = (
    <View>
      {heroSection}
      {serviceSection}
      {categorySection}
      <View className="pt-8">
        {sectionHeader(
          'New Arrivals',
          'Fresh additions to the Stree collection with a cleaner card layout.',
          () => {
            if (selectedCategory) {
              router.push({
                pathname: '/products',
                params: { category: selectedCategory },
              });
              return;
            }

            router.push('/products');
          }
        )}
      </View>

      {error && !loading && data.length === 0 ? (
        <View className="px-4 pb-4">
          <Card>
            <Text className="text-[15px] font-medium" style={{ color: theme.colors.text }}>
              We could not load the latest collection.
            </Text>
            <Text className="mt-2 text-[14px] leading-6" style={{ color: theme.colors.textMuted }}>
              {error}
            </Text>
            <Button className="mt-4" onPress={() => void refetch()} text="Try Again" />
          </Card>
        </View>
      ) : null}
    </View>
  );

  const bestsellersSection =
    bestsellers.length > 0 ? (
      <View className="pb-10 pt-8">
        {sectionHeader(
          'Bestsellers',
          'Loved by Stree shoppers across India and easier to scan in a stacked list.',
          () => router.push('/products')
        )}
        <View className="gap-3 px-4">
          {bestsellers.slice(0, 4).map((item) => (
            <SareeCard
              key={item.id}
              isFavorite={isFavorite(item.id)}
              onToggleWishlist={(product) => toggle(product)}
              product={item}
            />
          ))}
        </View>
      </View>
    ) : null;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <Header
        cartCount={count}
        showCartButton={false}
        showLogo
        showProfileButton
        subtitle="Stree"
        title="For your next occasion"
      />

      {loading && data.length === 0 ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {heroSection}
          {serviceSection}
          {categorySection}
          <View className="px-4 pt-8">
            <LoadingSkeleton count={4} variant="list" />
          </View>
        </ScrollView>
      ) : (
        <SareeGrid
          ListFooterComponent={bestsellersSection}
          ListHeaderComponent={listHeader}
          contentContainerStyle={{ paddingBottom: 24 }}
          emptyActionLabel="Browse All Sarees"
          emptyMessage="There are no products in this edit yet. Explore the full catalogue instead."
          emptyTitle="No new arrivals found"
          isFavorite={isFavorite}
          loading={loading}
          onPressEmptyAction={() => router.push('/products')}
          onToggleWishlist={(product) => toggle(product)}
          products={newArrivals}
          refreshControl={
            <RefreshControl
              onRefresh={() => void refetch()}
              refreshing={refreshing}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

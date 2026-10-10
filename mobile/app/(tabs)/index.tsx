import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useCart } from '../../hooks/useCart';
import { useProducts } from '../../hooks/useProducts';
import { useWishlist } from '../../hooks/useWishlist';
import { fetchHomeCategories } from '../../lib/api';
import { getTheme } from '../../lib/theme';
import type { HomeCategoryCard, Product } from '../../lib/types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import CategoryChip from '../../components/common/CategoryChip';
import Header from '../../components/common/Header';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SareeCard from '../../components/common/SareeCard';
import SareeGrid from '../../components/common/SareeGrid';
import { PriceTag } from '../../components/common/PriceTag';

const HERO_BLURHASH = 'L6Pj0^#*0M-V~q^+M{Rj9Fj]~qxu';
type CategoryHighlight = {
  category: string;
  image: string;
  count: number;
  eyebrow: string;
  title: string;
  description: string;
  overlay: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

const CATEGORY_STORY: Record<
  string,
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
    overlay: 'rgba(73, 42, 18, 0.72)',
    icon: 'diamond-outline',
  },
  Cotton: {
    eyebrow: 'Everyday Ease',
    title: 'Lightweight comfort for repeat wear',
    description: 'Breathable sarees that still feel considered and premium.',
    overlay: 'rgba(23, 56, 38, 0.72)',
    icon: 'leaf-outline',
  },
  Designer: {
    eyebrow: 'Designer Picks',
    title: 'Sharper looks with statement detailing',
    description: 'Fashion-first drapes built for compliments and occasions.',
    overlay: 'rgba(49, 28, 58, 0.72)',
    icon: 'sparkles-outline',
  },
  Bridal: {
    eyebrow: 'Wedding Edit',
    title: 'Ceremony-ready drapes with richer character',
    description: 'Luminous tones and occasion-first silhouettes for milestone moments.',
    overlay: 'rgba(86, 20, 40, 0.76)',
    icon: 'rose-outline',
  },
  Seasonal: {
    eyebrow: 'Fresh Drops',
    title: 'New arrivals curated for what shoppers want now',
    description: 'Timely edits that keep the collection feeling fresh and alive.',
    overlay: 'rgba(80, 49, 16, 0.72)',
    icon: 'sunny-outline',
  },
  'Party Wear': {
    eyebrow: 'Party Edit',
    title: 'Statement drapes for festive evenings',
    description: 'Occasion-first sarees selected to feel bold, polished, and easy to shop.',
    overlay: 'rgba(78, 26, 41, 0.76)',
    icon: 'sparkles-outline',
  },
  Casual: {
    eyebrow: 'Daily Style',
    title: 'Easy drapes for comfortable repeat wear',
    description: 'Relaxed silhouettes that still look put-together for everyday dressing.',
    overlay: 'rgba(33, 53, 45, 0.72)',
    icon: 'cafe-outline',
  },
  Banarasi: {
    eyebrow: 'Banarasi Focus',
    title: 'Traditional richness with heritage detail',
    description: 'Browse ornate weaves chosen for gifting, ceremonies, and standout wardrobes.',
    overlay: 'rgba(68, 35, 19, 0.76)',
    icon: 'flower-outline',
  },
  Chanderi: {
    eyebrow: 'Chanderi Edit',
    title: 'Light shimmer with graceful structure',
    description: 'Elegant pieces that balance refined texture and all-day wearability.',
    overlay: 'rgba(56, 41, 20, 0.74)',
    icon: 'diamond-outline',
  },
  Paithani: {
    eyebrow: 'Paithani Select',
    title: 'Signature motifs with celebratory depth',
    description: 'Handpicked occasion looks with stronger colour, pattern, and presence.',
    overlay: 'rgba(73, 24, 38, 0.76)',
    icon: 'color-palette-outline',
  },
  Tussar: {
    eyebrow: 'Tussar Stories',
    title: 'Textured weaves with understated luxury',
    description: 'A calmer edit of artisanal styles for elegant dressing and gifting.',
    overlay: 'rgba(58, 43, 22, 0.74)',
    icon: 'leaf-outline',
  },
};

const CATEGORY_REMOTE_FALLBACKS: Record<string, string> = {
  Silk:
    'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&q=80',
  Cotton:
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
  Designer:
    'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=1200&q=80',
  Bridal:
    'https://images.unsplash.com/photo-1603217192634-61068e4d4bf9?auto=format&fit=crop&w=1200&q=80',
  Seasonal:
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80',
  'Party Wear':
    'https://images.unsplash.com/photo-1603217192634-61068e4d4bf9?auto=format&fit=crop&w=1200&q=80',
  Casual:
    'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1200&q=80',
  Banarasi:
    'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=1200&q=80',
  Chanderi:
    'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=1200&q=80',
  Paithani:
    'https://images.unsplash.com/photo-1603217192634-61068e4d4bf9?auto=format&fit=crop&w=1200&q=80',
  Tussar:
    'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=1200&q=80',
};

const GENERIC_SAREE_FALLBACKS = [
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1603217192634-61068e4d4bf9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=1200&q=80',
];

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

function buildFallbackCategoryCards(products: Product[]): HomeCategoryCard[] {
  const cardsByCategory = new Map<string, HomeCategoryCard>();

  for (const product of products) {
    if (!product.category || !product.image || cardsByCategory.has(product.category)) {
      continue;
    }

    cardsByCategory.set(product.category, {
      name: product.category,
      image: product.image,
      count: products.filter((item) => item.category === product.category).length,
    });
  }

  return Array.from(cardsByCategory.values());
}

function isRenderableCategoryImage(image?: string): boolean {
  if (!image) {
    return false;
  }

  const normalized = image.trim().toLowerCase();
  // RN Image / expo-image cannot reliably render remote SVG category assets.
  return (
    normalized.length > 0 &&
    !normalized.endsWith('.svg') &&
    !normalized.includes('.svg?')
  );
}

function normalizeCategoryImage(image?: string | null): string | null {
  if (!image) {
    return null;
  }

  const normalized = image.trim();
  return isRenderableCategoryImage(normalized) ? normalized : null;
}

function firstAvailableImage(
  candidates: Array<string | null | undefined>,
  usedImages: Set<string>
): string {
  const usableCandidates = candidates.filter((candidate): candidate is string => Boolean(candidate));
  return usableCandidates.find((candidate) => !usedImages.has(candidate)) ?? usableCandidates[0] ?? '';
}

function isDefinedString(value: string | null): value is string {
  return Boolean(value);
}

function buildProductImagePool(products: Product[]): string[] {
  return Array.from(
    new Set(
      products.flatMap((product) =>
        [product.image, ...product.images].map((image) => normalizeCategoryImage(image))
      ).filter(isDefinedString)
    )
  );
}

function buildDisplayCategoryCards(
  categories: HomeCategoryCard[],
  products: Product[]
): HomeCategoryCard[] {
  const fallbackImages = buildProductImagePool(products);
  const genericFallbackImages = Array.from(
    new Set(GENERIC_SAREE_FALLBACKS.map((image) => normalizeCategoryImage(image)).filter(isDefinedString))
  );
  const usedImages = new Set<string>();
  let fallbackIndex = 0;
  let genericFallbackIndex = 0;

  const nextUnusedPoolImage = (pool: string[], index: 'product' | 'generic'): string | null => {
    const currentIndex = index === 'product' ? fallbackIndex : genericFallbackIndex;

    for (let pointer = currentIndex; pointer < pool.length; pointer += 1) {
      const candidate = pool[pointer];
      if (!candidate || usedImages.has(candidate)) {
        continue;
      }

      if (index === 'product') {
        fallbackIndex = pointer + 1;
      } else {
        genericFallbackIndex = pointer + 1;
      }

      return candidate;
    }

    return pool.find((candidate) => Boolean(candidate) && !usedImages.has(candidate)) ?? pool[0] ?? null;
  };

  return categories.map((category) => {
    const normalizedImage = normalizeCategoryImage(category.image);
    const remoteFallback = normalizeCategoryImage(CATEGORY_REMOTE_FALLBACKS[category.name]);
    const categoryProductImage = normalizeCategoryImage(
      products.find(
        (product) =>
          product.category?.trim().toLowerCase() === category.name.trim().toLowerCase() &&
          product.image
      )?.image
    );
    const resolvedImage = firstAvailableImage(
      [
        categoryProductImage,
        normalizedImage,
        nextUnusedPoolImage(fallbackImages, 'product'),
        remoteFallback,
        nextUnusedPoolImage(genericFallbackImages, 'generic'),
      ],
      usedImages
    );

    if (resolvedImage) {
      usedImages.add(resolvedImage);
    }

    return {
      ...category,
      image: resolvedImage,
    };
  });
}

function shortenCopy(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}...`;
}

function buildHeroStory(product: Product) {
  const story = buildCategoryStory(product.category);
  const description = product.description?.trim()
    ? shortenCopy(product.description.trim(), 110)
    : story.description;
  const supportingNote =
    product.reviews > 0 && product.rating > 0
      ? `${product.rating.toFixed(1)} rating • ${product.reviews} review${product.reviews === 1 ? '' : 's'}`
      : 'Fresh arrival • Ready for your next look';
  const savingPercent =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null;

  return {
    eyebrow: story.eyebrow,
    title: story.title,
    description,
    icon: story.icon,
    supportingNote,
    savingPercent,
  };
}

function buildCategoryStory(category: string) {
  return (
    CATEGORY_STORY[category] ?? {
      eyebrow: `${category} Edit`,
      title: `${category} styles from the live Stree collection`,
      description: 'Fresh web-backed picks arranged for quick browsing and stronger visual clarity.',
      overlay: 'rgba(38, 28, 23, 0.74)',
      icon: 'sparkles-outline' as const,
    }
  );
}

function buildCategoryHighlights(categories: HomeCategoryCard[]): CategoryHighlight[] {
  return categories.map((category) => ({
    category: category.name,
    image: category.image,
    count: category.count,
    ...buildCategoryStory(category.name),
  }));
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
  const [homeCategories, setHomeCategories] = useState<HomeCategoryCard[]>([]);
  const [heroIndex, setHeroIndex] = useState<number>(0);
  const heroIndexRef = useRef<number>(0);
  const heroTouchXRef = useRef<number | null>(null);
  const { data, error, loading, refreshing, refetch, setFilters } = useProducts({
    limit: 12,
  });

  useEffect(() => {
    setFilters({
      category: selectedCategory,
    });
  }, [selectedCategory, setFilters]);

  const loadHomeCategories = useCallback(async (): Promise<void> => {
    try {
      const categories = await fetchHomeCategories();
      setHomeCategories(categories);
    } catch {
      setHomeCategories([]);
    }
  }, []);

  useEffect(() => {
    void loadHomeCategories();
  }, [loadHomeCategories]);

  const newArrivals = useMemo(() => data.slice(0, 4), [data]);
  const bestsellers = useMemo(() => sortBestsellers(data), [data]);
  const heroSlides = useMemo(() => (data.length > 0 ? data.slice(0, 4) : []), [data]);
  const categoryCards = useMemo(
    () =>
      buildDisplayCategoryCards(
        homeCategories.length > 0 ? homeCategories : buildFallbackCategoryCards(data),
        data
      ),
    [data, homeCategories]
  );
  const categoryHighlights = useMemo(
    () => buildCategoryHighlights(categoryCards),
    [categoryCards]
  );
  const quickCategoryFilters = useMemo(
    () => Array.from(new Set(['All', ...categoryCards.map((category) => category.name)])),
    [categoryCards]
  );
  const isCompactHomeWidth = width < 395;
  const heroCardWidth = width - 32;
  const heroImageHeight = isCompactHomeWidth ? 246 : 270;
  const featuredCategory = categoryHighlights[0] ?? null;
  const secondaryCategoryHighlights = categoryHighlights.slice(1, 5);
  const secondaryCategoryCardWidth = (width - 32 - 12) / 2;

  const scrollHeroToIndex = useCallback(
    (nextIndex: number): void => {
      if (heroSlides.length === 0) {
        return;
      }

      const clampedIndex =
        ((nextIndex % heroSlides.length) + heroSlides.length) % heroSlides.length;
      heroIndexRef.current = clampedIndex;
      setHeroIndex(clampedIndex);
    },
    [heroSlides.length]
  );

  useEffect(() => {
    heroIndexRef.current = heroIndex;
  }, [heroIndex]);

  useEffect(() => {
    if (heroSlides.length === 0) {
      setHeroIndex(0);
      heroIndexRef.current = 0;
      return;
    }

    if (heroIndex >= heroSlides.length) {
      setHeroIndex(0);
      heroIndexRef.current = 0;
    }
  }, [heroIndex, heroSlides.length]);

  useEffect(() => {
    if (heroSlides.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      const nextIndex = (heroIndexRef.current + 1) % heroSlides.length;
      scrollHeroToIndex(nextIndex);
    }, 4000);

    return () => {
      clearInterval(interval);
    };
  }, [heroSlides.length, scrollHeroToIndex]);

  const handleHeroTouchStart = useCallback((pageX: number): void => {
    heroTouchXRef.current = pageX;
  }, []);

  const handleHeroTouchEnd = useCallback(
    (pageX: number): void => {
      const startX = heroTouchXRef.current;
      heroTouchXRef.current = null;

      if (startX == null || heroSlides.length <= 1) {
        return;
      }

      const deltaX = pageX - startX;
      if (deltaX <= -48) {
        scrollHeroToIndex(heroIndexRef.current + 1);
      } else if (deltaX >= 48) {
        scrollHeroToIndex(heroIndexRef.current - 1);
      }
    },
    [heroSlides.length, scrollHeroToIndex]
  );

  const handleCategoryPress = (category: string): void => {
    if (category === 'All') {
      setSelectedCategory(undefined);
      return;
    }

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

  const activeHeroProduct = heroSlides[heroIndex] ?? heroSlides[0] ?? null;
  const activeHeroStory = activeHeroProduct ? buildHeroStory(activeHeroProduct) : null;

  const heroSection =
    activeHeroProduct && activeHeroStory ? (
      <View className="px-4 pt-4">
        <View
          onTouchEnd={(event) => handleHeroTouchEnd(event.nativeEvent.pageX)}
          onTouchStart={(event) => handleHeroTouchStart(event.nativeEvent.pageX)}
          style={{ width: heroCardWidth, overflow: 'hidden' }}
        >
          <Pressable
            accessibilityRole="button"
            key={activeHeroProduct.id}
            onPress={() => router.push(`/product/${activeHeroProduct.id}`)}
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
              <View className="relative" style={{ height: heroImageHeight }}>
                <Image
                  contentFit="cover"
                  placeholder={{ blurhash: HERO_BLURHASH }}
                  source={
                    activeHeroProduct.image ? { uri: activeHeroProduct.image } : undefined
                  }
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: theme.colors.border,
                  }}
                  transition={180}
                />

                <View
                  className="absolute inset-0"
                  style={{ backgroundColor: 'rgba(18, 12, 10, 0.14)' }}
                />

                <View className="absolute inset-x-0 top-0 flex-row items-start justify-between px-4 pt-4">
                  <View
                    className="rounded-full px-3 py-1.5"
                    style={{ backgroundColor: 'rgba(18, 12, 10, 0.58)' }}
                  >
                    <Text
                      className="text-[11px] font-semibold uppercase"
                      style={{ color: '#FFFFFF' }}
                    >
                      {activeHeroStory.eyebrow}
                    </Text>
                  </View>

                  {activeHeroStory.savingPercent ? (
                    <View
                      className="rounded-full px-3 py-1.5"
                      style={{ backgroundColor: 'rgba(255, 247, 242, 0.94)' }}
                    >
                      <Text
                        className="text-[11px] font-semibold"
                        style={{ color: theme.colors.primary }}
                      >
                        {activeHeroStory.savingPercent}% off
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View className="absolute inset-x-0 bottom-0 px-4 pb-4">
                  <View
                    className="flex-row items-center justify-between rounded-[20px] border px-4 py-3"
                    style={{
                      backgroundColor: 'rgba(18, 12, 10, 0.54)',
                      borderColor: 'rgba(255, 255, 255, 0.14)',
                    }}
                  >
                    <View className="mr-3 flex-1">
                      <Text
                        className="text-[15px] font-semibold"
                        numberOfLines={1}
                        style={{ color: '#FFFFFF' }}
                      >
                        {activeHeroProduct.name}
                      </Text>
                      <Text
                        className="mt-1 text-[12px]"
                        numberOfLines={1}
                        style={{ color: 'rgba(255, 255, 255, 0.82)' }}
                      >
                        {activeHeroProduct.category} • {activeHeroProduct.fabric}
                      </Text>
                    </View>
                    <Ionicons
                      color="#FFFFFF"
                      name="arrow-forward-circle-outline"
                      size={26}
                    />
                  </View>
                </View>
              </View>

              <View
                className="px-5 pb-5 pt-5"
                style={{ backgroundColor: theme.colors.surface }}
              >
                <View className="flex-row items-start justify-between gap-4">
                  <View className="flex-1">
                    <Text
                      className="text-[24px] font-semibold"
                      style={{
                        color: theme.colors.text,
                        lineHeight: isCompactHomeWidth ? 30 : 32,
                      }}
                    >
                      {activeHeroStory.title}
                    </Text>
                    <Text
                      className="mt-2 text-[14px]"
                      style={{
                        color: theme.colors.textMuted,
                        lineHeight: 22,
                      }}
                    >
                      {activeHeroStory.description}
                    </Text>
                  </View>

                  <View
                    className="h-12 w-12 items-center justify-center rounded-[18px]"
                    style={{ backgroundColor: `${theme.colors.primary}10` }}
                  >
                    <Ionicons
                      color={theme.colors.primary}
                      name={activeHeroStory.icon}
                      size={22}
                    />
                  </View>
                </View>

                <View className="mt-4 flex-row flex-wrap gap-2">
                  {[
                    activeHeroProduct.fabric,
                    activeHeroProduct.occasion,
                    activeHeroProduct.inStock ? 'Ready to ship' : 'Limited stock',
                  ]
                    .filter(Boolean)
                    .slice(0, 3)
                    .map((item) => (
                      <View
                        key={item}
                        className="rounded-full px-3 py-2"
                        style={{ backgroundColor: `${theme.colors.primary}0F` }}
                      >
                        <Text
                          className="text-[12px] font-medium"
                          style={{ color: theme.colors.primary }}
                        >
                          {item}
                        </Text>
                      </View>
                    ))}
                </View>

                <View className="mt-4 flex-row items-end justify-between gap-4">
                  <View className="flex-1">
                    <Text
                      className="text-[12px]"
                      style={{ color: theme.colors.textMuted }}
                    >
                      {activeHeroStory.supportingNote}
                    </Text>
                    <Text
                      className="mt-1 text-[13px] font-semibold"
                      style={{ color: theme.colors.primary }}
                    >
                      Swipe or use arrows for more picks
                    </Text>
                  </View>

                  <View
                    className="rounded-[20px] border px-4 py-3"
                    style={{
                      backgroundColor: `${theme.colors.primary}08`,
                      borderColor: `${theme.colors.primary}18`,
                    }}
                  >
                    <PriceTag
                      mrp={activeHeroProduct.mrp}
                      size="sm"
                      value={activeHeroProduct.price}
                    />
                    <Text
                      className="mt-1 text-[12px] font-semibold"
                      style={{ color: theme.colors.primary }}
                    >
                      Shop now
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          </Pressable>

          {heroSlides.length > 1 ? (
            <View pointerEvents="box-none" style={StyleSheet.absoluteFillObject}>
              <Pressable
                accessibilityLabel="Previous featured saree"
                accessibilityRole="button"
                hitSlop={12}
                onPress={() => scrollHeroToIndex(heroIndex - 1)}
                style={{
                  alignItems: 'center',
                  backgroundColor: 'rgba(18, 12, 10, 0.78)',
                  borderColor: 'rgba(255,255,255,0.7)',
                  borderRadius: 24,
                  borderWidth: 1.5,
                  elevation: 12,
                  height: 48,
                  justifyContent: 'center',
                  left: 10,
                  position: 'absolute',
                  top: heroImageHeight / 2 - 24,
                  width: 48,
                }}
              >
                <Ionicons color="#FFFFFF" name="chevron-back" size={24} />
              </Pressable>

              <Pressable
                accessibilityLabel="Next featured saree"
                accessibilityRole="button"
                hitSlop={12}
                onPress={() => scrollHeroToIndex(heroIndex + 1)}
                style={{
                  alignItems: 'center',
                  backgroundColor: 'rgba(18, 12, 10, 0.78)',
                  borderColor: 'rgba(255,255,255,0.7)',
                  borderRadius: 24,
                  borderWidth: 1.5,
                  elevation: 12,
                  height: 48,
                  justifyContent: 'center',
                  position: 'absolute',
                  right: 10,
                  top: heroImageHeight / 2 - 24,
                  width: 48,
                }}
              >
                <Ionicons color="#FFFFFF" name="chevron-forward" size={24} />
              </Pressable>
            </View>
          ) : null}
        </View>

        {heroSlides.length > 1 ? (
          <View className="mt-4 flex-row items-center justify-center gap-2">
            {heroSlides.map((slide, index) => (
              <Pressable
                key={`${slide.id}-indicator`}
                accessibilityLabel={`Show featured saree ${index + 1}`}
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => scrollHeroToIndex(index)}
              >
                <View
                  className="h-2 rounded-full"
                  style={{
                    width: heroIndex === index ? 22 : 8,
                    backgroundColor:
                      heroIndex === index ? theme.colors.primary : theme.colors.border,
                  }}
                />
              </Pressable>
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
                  source={featuredCategory.image ? { uri: featuredCategory.image } : undefined}
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: theme.colors.border,
                  }}
                  transition={0}
                />

                <View
                  className="absolute inset-0"
                  style={{ backgroundColor: 'rgba(18, 12, 10, 0.18)' }}
                />

                <View className="absolute inset-x-0 bottom-0 p-5">
                  <View
                    className="rounded-[24px] border p-5"
                    style={{
                      backgroundColor: 'rgba(18, 12, 10, 0.84)',
                      borderColor: 'rgba(255, 255, 255, 0.14)',
                    }}
                  >
                    <View className="mb-3 flex-row items-center justify-between gap-3">
                      <View className="flex-row items-center gap-2">
                        <Ionicons color="#FFFFFF" name={featuredCategory.icon} size={16} />
                        <Text
                          className="text-[12px] font-semibold uppercase"
                          style={{ color: '#FFFFFF' }}
                        >
                          {featuredCategory.eyebrow}
                        </Text>
                      </View>
                      <View
                        className="rounded-full px-3 py-1.5"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.16)' }}
                      >
                        <Text className="text-[11px] font-semibold" style={{ color: '#FFFFFF' }}>
                          {featuredCategory.count > 0
                            ? `${featuredCategory.count} style${featuredCategory.count === 1 ? '' : 's'}`
                            : 'Coming soon'}
                        </Text>
                      </View>
                    </View>
                    <Text
                      className="text-[22px] font-semibold leading-8"
                      style={{ color: '#FFFFFF' }}
                    >
                      {featuredCategory.title}
                    </Text>
                    <Text
                      className="mt-2 text-[14px] leading-6"
                      style={{ color: 'rgba(255, 255, 255, 0.92)' }}
                    >
                      {featuredCategory.description}
                    </Text>
                  </View>
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
                  source={item.image ? { uri: item.image } : undefined}
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: theme.colors.border,
                  }}
                  transition={0}
                />

                <View
                  className="absolute inset-0"
                  style={{ backgroundColor: 'rgba(18, 12, 10, 0.28)' }}
                />

                <View className="absolute inset-x-0 bottom-0 p-3">
                  <View
                    className="rounded-[18px] border px-3 py-3"
                    style={{
                      backgroundColor: 'rgba(18, 12, 10, 0.84)',
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                    }}
                  >
                    <Text
                      className="text-[11px] font-semibold uppercase"
                      style={{ color: '#FFFFFF' }}
                    >
                      {item.eyebrow}
                    </Text>
                    <Text
                      className="mt-2 text-[16px] font-semibold leading-6"
                      style={{ color: '#FFFFFF' }}
                    >
                      {item.category}
                    </Text>
                    <Text
                      className="mt-1 text-[12px]"
                      style={{ color: 'rgba(255, 255, 255, 0.88)' }}
                    >
                      {item.count > 0
                        ? `${item.count} style${item.count === 1 ? '' : 's'}`
                        : 'Coming soon'}
                    </Text>
                  </View>
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
            {quickCategoryFilters.map((category) => (
              <CategoryChip
                key={category}
                active={category === 'All' ? !selectedCategory : selectedCategory === category}
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
              onRefresh={() => void Promise.all([refetch(), loadHomeCategories()])}
              refreshing={refreshing}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useCart } from '../../hooks/useCart';
import { useProduct } from '../../hooks/useProduct';
import { useWishlist } from '../../hooks/useWishlist';
import { getTheme } from '../../lib/theme';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Header from '../../components/common/Header';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { PriceTag } from '../../components/common/PriceTag';

const IMAGE_BLURHASH = 'L6Pj0^#*0M-V~q^+M{Rj9Fj]~qxu';

type DetailSectionKey = 'fabric' | 'occasion' | 'care';

function getRatingSummary(rating: number, reviews: number): string {
  if (reviews > 0 && rating > 0) {
    return `${rating.toFixed(1)} (${reviews} reviews)`;
  }

  return 'Fresh arrival | Awaiting first review';
}

/**
 * Renders the dynamic product detail screen with gallery, details, and cart actions.
 */
export default function ProductDetailScreen(): React.JSX.Element {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const { add, count, items } = useCart();
  const { isFavorite, toggle } = useWishlist();
  const { data: product, error, loading, refetch } = useProduct(id);
  const [expandedSections, setExpandedSections] = useState<Record<DetailSectionKey, boolean>>({
    fabric: true,
    occasion: false,
    care: false,
  });
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const images = useMemo(() => product?.images ?? [], [product?.images]);

  const toggleSection = (section: DetailSectionKey): void => {
    setExpandedSections((currentSections) => ({
      ...currentSections,
      [section]: !currentSections[section],
    }));
  };

  const handleShare = async (): Promise<void> => {
    if (!product) {
      return;
    }

    const productUrl = product.slug
      ? `https://stree-sarees-com.vercel.app/product/${product.slug}`
      : 'https://stree-sarees-com.vercel.app';

    await Share.share({
      message: `${product.name}\n${productUrl}`,
    });
  };

  const handleBuyNow = (): void => {
    if (!product || !product.inStock) {
      return;
    }

    if (!items.some((item) => item.id === product.id)) {
      add(product, 1);
    }

    router.push('/checkout');
  };

  if (loading && !product) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
        <Header
          cartCount={count}
          showBackButton
          showCartButton={false}
          showProfileButton
          subtitle="Catalogue"
          title="Product Details"
        />
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          <LoadingSkeleton variant="banner" />
          <View className="mt-6">
            <LoadingSkeleton count={4} variant="text" />
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
        <Header
          cartCount={count}
          showBackButton
          showCartButton={false}
          showProfileButton
          subtitle="Catalogue"
          title="Product Details"
        />
        <EmptyState
          ctaLabel="Try Again"
          fullScreen
          iconName="alert-circle-outline"
          message={error ?? 'This saree is unavailable right now.'}
          onPressCta={() => void refetch()}
          title="Unable to load product"
        />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <Header
        cartCount={count}
        showBackButton={false}
        showCartButton={false}
        showProfileButton
        subtitle="Catalogue"
        title="Product Details"
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          horizontal
          onMomentumScrollEnd={(event) => {
            const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(nextIndex);
          }}
          pagingEnabled
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
        >
          {(images.length > 0 ? images : ['']).map((image, index) => (
            <View key={`${image}-${index}`} style={{ width }}>
              <ScrollView
                bounces={false}
                centerContent
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
                maximumZoomScale={3}
                minimumZoomScale={1}
                showsVerticalScrollIndicator={false}
              >
                <Image
                  contentFit="cover"
                  placeholder={{ blurhash: IMAGE_BLURHASH }}
                  source={image ? { uri: image } : undefined}
                  style={{
                    width: width - 32,
                    height: width * 1.25,
                    borderRadius: 28,
                    backgroundColor: theme.colors.border,
                  }}
                  transition={0}
                />
              </ScrollView>
            </View>
          ))}
        </ScrollView>

        {images.length > 1 ? (
          <View className="mt-4 flex-row items-center justify-center gap-2">
            {images.map((image, index) => (
              <View
                key={`${image}-dot-${index}`}
                className="h-2 rounded-full"
                style={{
                  backgroundColor:
                    index === currentImageIndex ? theme.colors.primary : theme.colors.border,
                  width: index === currentImageIndex ? 24 : 8,
                }}
              />
            ))}
          </View>
        ) : null}

        <View className="px-4 pt-6">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-[28px] font-semibold leading-10" style={{ color: theme.colors.text }}>
                {product.name}
              </Text>
              <View className="mt-3 flex-row items-center gap-2">
                <Text className="text-[13px]" style={{ color: theme.colors.textMuted }}>
                  {getRatingSummary(product.rating, product.reviews)}
                </Text>
              </View>
            </View>

            <Badge text={product.inStock ? 'In Stock' : 'Sold Out'} variant={product.inStock ? 'success' : 'outline'} />
          </View>

          <View className="mt-5">
            <PriceTag emphasize mrp={product.mrp} size="lg" value={product.price} />
          </View>

          <View className="mt-4 flex-row flex-wrap gap-2">
            <Badge text="Cash on Delivery" variant="success" />
            <Badge text={product.fabric} variant="secondary" />
            <Badge text={product.category} variant="primary" />
          </View>

          <View className="mt-4 flex-row gap-3">
            <Pressable
              accessibilityLabel={isFavorite(product.id) ? 'Remove from wishlist' : 'Save to wishlist'}
              accessibilityRole="button"
              className="flex-1 flex-row items-center justify-center rounded-[18px] border px-4 py-3"
              onPress={() => toggle(product)}
              style={({ pressed }) => ({
                backgroundColor: isFavorite(product.id)
                  ? theme.colors.secondary
                  : pressed
                    ? `${theme.colors.primary}10`
                    : theme.colors.surface,
                borderColor: isFavorite(product.id) ? theme.colors.secondary : theme.colors.border,
              })}
            >
              <Ionicons
                color={isFavorite(product.id) ? '#2C2C2C' : theme.colors.primary}
                name={isFavorite(product.id) ? 'heart' : 'heart-outline'}
                size={18}
              />
              <Text
                className="ml-2 text-[14px] font-semibold"
                style={{ color: isFavorite(product.id) ? '#2C2C2C' : theme.colors.text }}
              >
                {isFavorite(product.id) ? 'Saved' : 'Wishlist'}
              </Text>
            </Pressable>

            <Pressable
              accessibilityLabel="Share product"
              accessibilityRole="button"
              className="w-[116px] flex-row items-center justify-center rounded-[18px] border px-4 py-3"
              onPress={() => void handleShare()}
              style={({ pressed }) => ({
                backgroundColor: pressed ? `${theme.colors.primary}10` : theme.colors.surface,
                borderColor: theme.colors.border,
              })}
            >
              <Ionicons color={theme.colors.primary} name="share-social-outline" size={18} />
              <Text className="ml-2 text-[14px] font-semibold" style={{ color: theme.colors.text }}>
                Share
              </Text>
            </Pressable>
          </View>

          <Text className="mt-6 text-[15px] leading-7" style={{ color: theme.colors.textMuted }}>
            {product.description}
          </Text>

          <View className="mt-8 gap-3">
            <Card className="rounded-[22px]">
              <Pressable
                accessibilityRole="button"
                className="flex-row items-center justify-between"
                onPress={() => toggleSection('fabric')}
              >
                <Text className="text-[15px] font-semibold" style={{ color: theme.colors.text }}>
                  Fabric
                </Text>
                <Ionicons
                  color={theme.colors.text}
                  name={expandedSections.fabric ? 'chevron-up' : 'chevron-down'}
                  size={18}
                />
              </Pressable>
              {expandedSections.fabric ? (
                <Text className="mt-3 text-[14px] leading-6" style={{ color: theme.colors.textMuted }}>
                  {product.fabric}
                </Text>
              ) : null}
            </Card>

            <Card className="rounded-[22px]">
              <Pressable
                accessibilityRole="button"
                className="flex-row items-center justify-between"
                onPress={() => toggleSection('occasion')}
              >
                <Text className="text-[15px] font-semibold" style={{ color: theme.colors.text }}>
                  Occasion
                </Text>
                <Ionicons
                  color={theme.colors.text}
                  name={expandedSections.occasion ? 'chevron-up' : 'chevron-down'}
                  size={18}
                />
              </Pressable>
              {expandedSections.occasion ? (
                <Text className="mt-3 text-[14px] leading-6" style={{ color: theme.colors.textMuted }}>
                  {product.occasion}
                </Text>
              ) : null}
            </Card>

            <Card className="rounded-[22px]">
              <Pressable
                accessibilityRole="button"
                className="flex-row items-center justify-between"
                onPress={() => toggleSection('care')}
              >
                <Text className="text-[15px] font-semibold" style={{ color: theme.colors.text }}>
                  Care Instructions
                </Text>
                <Ionicons
                  color={theme.colors.text}
                  name={expandedSections.care ? 'chevron-up' : 'chevron-down'}
                  size={18}
                />
              </Pressable>
              {expandedSections.care ? (
                <View className="mt-3 gap-2">
                  {(product.careInstructions?.length ? product.careInstructions : ['Dry clean recommended.', 'Store folded in a muslin bag.', 'Avoid direct fragrance on the fabric.']).map((instruction) => (
                    <View key={instruction} className="flex-row items-start gap-2">
                      <Ionicons color={theme.colors.secondary} name="ellipse" size={8} style={{ marginTop: 8 }} />
                      <Text className="flex-1 text-[14px] leading-6" style={{ color: theme.colors.textMuted }}>
                        {instruction}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </Card>
          </View>

          <View className="mt-8 flex-row gap-3">
            <View className="flex-1">
              <Button
                disabled={!product.inStock}
                onPress={() => add(product, 1)}
                text={product.inStock ? 'Add to Cart' : 'Out of Stock'}
                variant="secondary"
              />
            </View>
            <View className="flex-1">
              <Button
                disabled={!product.inStock}
                onPress={handleBuyNow}
                text="Buy Now"
                variant="success"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

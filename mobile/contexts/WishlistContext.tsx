import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../lib/storage';
import type { Product } from '../lib/types';
import {
  api,
  fetchSupabaseProductById,
  getSupabasePublicConfig,
  normalizeProduct,
  shouldPreferSupabaseCatalogReads,
} from '../lib/api';
import type { ApiProduct } from '../lib/types';
import { useToast } from './ToastContext';

export interface WishlistContextValue {
  favorites: string[];
  items: Product[];
  count: number;
  hydrated: boolean;
  toggle: (product: Product | string) => void;
  isFavorite: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

interface PersistedWishlist {
  ids: string[];
  items: Product[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function sanitizeWishlistIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter(
          (productId): productId is string =>
            typeof productId === 'string' && productId.trim().length > 0
        )
        .map((productId) => productId.trim())
    )
  );
}

function sanitizeProductSnapshot(value: unknown): Product | null {
  if (!isRecord(value) || typeof value.id !== 'string' || value.id.trim().length === 0) {
    return null;
  }

  const image =
    typeof value.image === 'string' && value.image.trim().length > 0 ? value.image.trim() : '';
  const images = Array.isArray(value.images)
    ? value.images.filter(
        (item): item is string => typeof item === 'string' && item.trim().length > 0
      )
    : image
      ? [image]
      : [];

  return {
    id: value.id.trim(),
    name:
      typeof value.name === 'string' && value.name.trim().length > 0
        ? value.name.trim()
        : 'Saved Saree',
    slug: typeof value.slug === 'string' && value.slug.trim().length > 0 ? value.slug.trim() : undefined,
    price: typeof value.price === 'number' ? value.price : 0,
    image,
    images,
    category:
      typeof value.category === 'string' && value.category.trim().length > 0
        ? value.category.trim()
        : 'Sarees',
    fabric:
      typeof value.fabric === 'string' && value.fabric.trim().length > 0
        ? value.fabric.trim()
        : 'Handpicked',
    occasion:
      typeof value.occasion === 'string' && value.occasion.trim().length > 0
        ? value.occasion.trim()
        : 'Occasion Wear',
    description:
      typeof value.description === 'string' && value.description.trim().length > 0
        ? value.description.trim()
        : 'Saved for later.',
    rating: typeof value.rating === 'number' ? value.rating : 0,
    reviews: typeof value.reviews === 'number' ? value.reviews : 0,
    inStock: value.inStock !== false,
    stockQty: typeof value.stockQty === 'number' ? value.stockQty : undefined,
    mrp: typeof value.mrp === 'number' ? value.mrp : null,
    colors: Array.isArray(value.colors)
      ? value.colors.filter(
          (item): item is string => typeof item === 'string' && item.trim().length > 0
        )
      : [],
    careInstructions: Array.isArray(value.careInstructions)
      ? value.careInstructions.filter(
          (item): item is string => typeof item === 'string' && item.trim().length > 0
        )
      : [],
    createdAt:
      typeof value.createdAt === 'string' && value.createdAt.trim().length > 0
        ? value.createdAt.trim()
        : undefined,
    updatedAt:
      typeof value.updatedAt === 'string' && value.updatedAt.trim().length > 0
        ? value.updatedAt.trim()
        : undefined,
  };
}

function sanitizeWishlistItems(value: unknown): Product[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const snapshots = value
    .map((item) => sanitizeProductSnapshot(item))
    .filter((item): item is Product => item !== null);

  return Array.from(new Map(snapshots.map((item) => [item.id, item])).values());
}

function sanitizeWishlist(value: unknown): PersistedWishlist {
  if (Array.isArray(value)) {
    const ids = sanitizeWishlistIds(value);
    const items = sanitizeWishlistItems(value);

    return {
      ids: Array.from(new Set([...ids, ...items.map((item) => item.id)])),
      items,
    };
  }

  if (!isRecord(value)) {
    return { ids: [], items: [] };
  }

  const ids = sanitizeWishlistIds(value.ids);
  const items = sanitizeWishlistItems(value.items);

  return {
    ids: Array.from(new Set([...ids, ...items.map((item) => item.id)])),
    items,
  };
}

function extractSingleProduct(payload: unknown): ApiProduct | null {
  if (isRecord(payload) && typeof payload.id === 'string') {
    return payload as unknown as ApiProduct;
  }

  if (isRecord(payload) && isRecord(payload.data)) {
    return extractSingleProduct(payload.data);
  }

  if (isRecord(payload) && isRecord(payload.product)) {
    return extractSingleProduct(payload.product);
  }

  return null;
}

async function fetchWishlistProductById(productId: string): Promise<Product | null> {
  if (shouldPreferSupabaseCatalogReads() && getSupabasePublicConfig()) {
    const direct = await fetchSupabaseProductById(productId).catch(() => null);
    if (direct) {
      return direct;
    }
  }

  try {
    const response = await api.get<unknown>(`/products/${productId}`);
    const extracted = extractSingleProduct(response.data);
    if (extracted) {
      return normalizeProduct(extracted);
    }
  } catch {
    // Fall through to Supabase when the app API is unavailable.
  }

  if (!getSupabasePublicConfig()) {
    return null;
  }

  return fetchSupabaseProductById(productId).catch(() => null);
}

export interface WishlistProviderProps {
  children: ReactNode;
}

/**
 * Provides persisted wishlist state and actions to the Stree mobile app.
 */
export function WishlistProvider({
  children,
}: WishlistProviderProps): React.JSX.Element {
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [items, setItems] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const hydrateWishlist = async (): Promise<void> => {
      try {
        const storedWishlist = await getStorageItem<PersistedWishlist | string[] | Product[]>(
          STORAGE_KEYS.wishlist
        );
        const sanitizedWishlist = sanitizeWishlist(storedWishlist);

        if (isMounted) {
          setFavorites(sanitizedWishlist.ids);
          setItems(sanitizedWishlist.items);
        }
      } finally {
        if (isMounted) {
          setHydrated(true);
        }
      }
    };

    void hydrateWishlist();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    void setStorageItem(STORAGE_KEYS.wishlist, {
      ids: favorites,
      items,
    }).catch(() => undefined);
  }, [favorites, hydrated, items]);

  useEffect(() => {
    if (!hydrated || favorites.length === 0) {
      return;
    }

    const existingIds = new Set(items.map((item) => item.id));
    const missingIds = favorites.filter((favoriteId) => !existingIds.has(favoriteId));

    if (missingIds.length === 0) {
      return;
    }

    let isMounted = true;

    const recoverMissingWishlistItems = async (): Promise<void> => {
      const recoveredEntries = await Promise.all(
        missingIds.map(async (favoriteId) => ({
          favoriteId,
          product: await fetchWishlistProductById(favoriteId),
        }))
      );

      if (!isMounted) {
        return;
      }

      const recoveredProducts = recoveredEntries
        .map((entry) => entry.product)
        .filter((product): product is Product => product !== null);
      const unavailableIds = recoveredEntries
        .filter((entry) => entry.product === null)
        .map((entry) => entry.favoriteId);

      if (recoveredProducts.length > 0) {
        setItems((currentItems) => [
          ...currentItems,
          ...recoveredProducts.filter(
            (product) => !currentItems.some((currentItem) => currentItem.id === product.id)
          ),
        ]);
      }

      if (unavailableIds.length > 0) {
        setFavorites((currentFavorites) =>
          currentFavorites.filter((favoriteId) => !unavailableIds.includes(favoriteId))
        );
      }
    };

    void recoverMissingWishlistItems();

    return () => {
      isMounted = false;
    };
  }, [favorites, hydrated, items]);

  const toggle = useCallback(
    (product: Product | string): void => {
      const normalizedProductId =
        typeof product === 'string' ? product.trim() : product.id.trim();

      if (!normalizedProductId) {
        return;
      }

      const isRemoving = favorites.includes(normalizedProductId);

      setFavorites((currentFavorites) =>
        currentFavorites.includes(normalizedProductId)
          ? currentFavorites.filter((favoriteId) => favoriteId !== normalizedProductId)
          : [normalizedProductId, ...currentFavorites]
      );
      setItems((currentItems) => {
        if (isRemoving) {
          return currentItems.filter((item) => item.id !== normalizedProductId);
        }

        if (typeof product === 'string') {
          return currentItems;
        }

        const snapshot = sanitizeProductSnapshot(product);

        if (!snapshot) {
          return currentItems;
        }

        return [snapshot, ...currentItems.filter((item) => item.id !== snapshot.id)];
      });

      showToast({
        title: isRemoving ? 'Removed from wishlist' : 'Saved to wishlist',
        message: isRemoving
          ? 'You can add it back any time from the catalogue.'
          : 'Your favourites are waiting inside Profile.',
        iconName: isRemoving ? 'heart-dislike-outline' : 'heart',
        tone: isRemoving ? 'primary' : 'accent',
      });
    },
    [favorites, showToast]
  );

  const isFavorite = useCallback(
    (productId: string): boolean => favorites.includes(productId.trim()),
    [favorites]
  );

  const value = useMemo<WishlistContextValue>(
    () => ({
      favorites,
      items,
      count: favorites.length,
      hydrated,
      toggle,
      isFavorite,
    }),
    [favorites, hydrated, isFavorite, items, toggle]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

/**
 * Returns the active wishlist context.
 */
export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider.');
  }

  return context;
}

export default WishlistProvider;

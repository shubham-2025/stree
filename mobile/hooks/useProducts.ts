import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import {
  api,
  buildProductQueryParams,
  getApiErrorMessage,
  normalizeProduct,
} from '../lib/api';
import type {
  ApiProduct,
  PaginationMeta,
  Product,
  ProductFilters,
} from '../lib/types';

export interface UseProductsOptions extends ProductFilters {
  enabled?: boolean;
}

export interface UseProductsResult {
  data: Product[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  page: number;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  setFilters: (nextFilters: Partial<ProductFilters>) => void;
}

interface ProductsPayload {
  items: Product[];
  meta: PaginationMeta;
}

function areFiltersEqual(left: ProductFilters, right: ProductFilters): boolean {
  return (
    left.category === right.category &&
    left.minPrice === right.minPrice &&
    left.maxPrice === right.maxPrice &&
    left.search === right.search &&
    left.limit === right.limit
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractCollectionPayload(payload: unknown): {
  rawItems: unknown[];
  total?: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
} {
  if (Array.isArray(payload)) {
    return { rawItems: payload };
  }

  if (!isRecord(payload)) {
    return { rawItems: [] };
  }

  const meta = isRecord(payload.meta) ? payload.meta : null;

  if (Array.isArray(payload.items)) {
    return {
      rawItems: payload.items,
      total:
        typeof payload.total === 'number'
          ? payload.total
          : meta && typeof meta.total === 'number'
            ? meta.total
            : undefined,
      page:
        typeof payload.page === 'number'
          ? payload.page
          : meta && typeof meta.page === 'number'
            ? meta.page
            : undefined,
      limit:
        typeof payload.limit === 'number'
          ? payload.limit
          : meta && typeof meta.limit === 'number'
            ? meta.limit
            : undefined,
      hasMore:
        typeof payload.hasMore === 'boolean'
          ? payload.hasMore
          : meta && typeof meta.hasMore === 'boolean'
            ? meta.hasMore
            : undefined,
    };
  }

  if (Array.isArray(payload.products)) {
    return {
      rawItems: payload.products,
      total:
        typeof payload.total === 'number'
          ? payload.total
          : meta && typeof meta.total === 'number'
            ? meta.total
            : undefined,
      page:
        typeof payload.page === 'number'
          ? payload.page
          : meta && typeof meta.page === 'number'
            ? meta.page
            : undefined,
      limit:
        typeof payload.limit === 'number'
          ? payload.limit
          : meta && typeof meta.limit === 'number'
            ? meta.limit
            : undefined,
      hasMore:
        typeof payload.hasMore === 'boolean'
          ? payload.hasMore
          : meta && typeof meta.hasMore === 'boolean'
            ? meta.hasMore
            : undefined,
    };
  }

  if (Array.isArray(payload.data)) {
    return extractCollectionPayload(payload.data);
  }

  if (isRecord(payload.data)) {
    return extractCollectionPayload(payload.data);
  }

  return { rawItems: [] };
}

function normalizeProductsPayload(
  payload: unknown,
  requestedPage: number,
  requestedLimit: number
): ProductsPayload {
  const extracted = extractCollectionPayload(payload);
  const items = extracted.rawItems
    .filter(isRecord)
    .map((item) => normalizeProduct(item as unknown as ApiProduct));
  const page = extracted.page ?? requestedPage;
  const limit = extracted.limit ?? requestedLimit;
  const total = extracted.total;
  const hasMore =
    typeof extracted.hasMore === 'boolean'
      ? extracted.hasMore
      : typeof total === 'number'
        ? page * limit < total
        : items.length >= limit;

  return {
    items,
    meta: {
      page,
      limit,
      total,
      hasMore,
    },
  };
}

/**
 * Fetches and manages the product catalogue with filters, pagination, and focus refetching.
 */
export function useProducts(initialFilters: UseProductsOptions = {}): UseProductsResult {
  const {
    enabled = true,
    category,
    minPrice,
    maxPrice,
    search,
    limit: initialLimit = 12,
  } = initialFilters;
  const [filters, setFiltersState] = useState<ProductFilters>({
    category,
    minPrice,
    maxPrice,
    search,
    limit: initialLimit,
  });
  const [page, setPage] = useState<number>(1);
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const requestIdRef = useRef<number>(0);
  const hasFocusedOnceRef = useRef<boolean>(false);

  const limit = filters.limit ?? 12;
  const serializedFilters = useMemo(
    () =>
      JSON.stringify({
        ...filters,
        limit,
      }),
    [filters, limit]
  );

  const fetchProducts = useCallback(
    async (targetPage: number, mode: 'initial' | 'refresh' | 'append'): Promise<void> => {
      if (!enabled) {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
        return;
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      if (mode === 'initial') {
        setLoading(true);
      } else if (mode === 'refresh') {
        setRefreshing(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const response = await api.get<unknown>('/products', {
          params: buildProductQueryParams({
            ...filters,
            page: targetPage,
            limit,
          }),
        });
        const normalized = normalizeProductsPayload(response.data, targetPage, limit);

        if (requestId !== requestIdRef.current) {
          return;
        }

        const resolvedPayload = normalized;

        setData((currentData) =>
          mode === 'append'
            ? Array.from(
                new Map(
                  [...currentData, ...resolvedPayload.items].map((product) => [product.id, product])
                ).values()
              )
            : resolvedPayload.items
        );
        setPage(targetPage);
        setHasMore(Boolean(resolvedPayload.meta.hasMore));
        setError(null);
        setFiltersState((currentFilters) => {
          const nextLimit = resolvedPayload.meta.limit ?? limit;

          if (currentFilters.limit === nextLimit) {
            return currentFilters;
          }

          return {
            ...currentFilters,
            limit: nextLimit,
          };
        });
      } catch (fetchError) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setError(
          getApiErrorMessage(fetchError, 'Unable to load sarees right now. Please try again.')
        );
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
          setLoadingMore(false);
        }
      }
    },
    [enabled, filters, limit]
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    void fetchProducts(1, 'initial');
  }, [enabled, fetchProducts, serializedFilters]);

  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        return undefined;
      }

      if (!hasFocusedOnceRef.current) {
        hasFocusedOnceRef.current = true;
        return undefined;
      }

      void fetchProducts(1, 'refresh');
      return undefined;
    }, [enabled, fetchProducts])
  );

  const refetch = useCallback(async (): Promise<void> => {
    await fetchProducts(1, 'refresh');
  }, [fetchProducts]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (!enabled || loading || refreshing || loadingMore || !hasMore) {
      return;
    }

    await fetchProducts(page + 1, 'append');
  }, [enabled, fetchProducts, hasMore, loading, loadingMore, page, refreshing]);

  const setFilters = useCallback((nextFilters: Partial<ProductFilters>): void => {
    const queryFilters = { ...nextFilters };
    delete queryFilters.page;
    setPage(1);

    setFiltersState((currentFilters) => {
      const nextState: ProductFilters = {
        ...currentFilters,
        ...queryFilters,
      };

      if (areFiltersEqual(currentFilters, nextState)) {
        return currentFilters;
      }

      return nextState;
    });
  }, []);

  return {
    data,
    loading,
    error,
    refreshing,
    loadingMore,
    hasMore,
    page,
    refetch,
    loadMore,
    setFilters,
  };
}

export default useProducts;

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import {
  api,
  getApiErrorMessage,
  normalizeProduct,
} from '../lib/api';
import type { ApiProduct, Product } from '../lib/types';

export interface UseProductResult {
  data: Product | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
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

/**
 * Fetches and manages a single product record with focus refetch support.
 */
export function useProduct(id?: string | string[]): UseProductResult {
  const productId = Array.isArray(id) ? id[0] : id;
  const [data, setData] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(productId));
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef<number>(0);
  const hasFocusedOnceRef = useRef<boolean>(false);

  const fetchProduct = useCallback(async (): Promise<void> => {
    if (!productId) {
      setData(null);
      setLoading(false);
      setError('Product not found.');
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);

    try {
      const response = await api.get<unknown>(`/products/${productId}`);
      const extractedProduct = extractSingleProduct(response.data);
      const product = extractedProduct ? normalizeProduct(extractedProduct) : null;

      if (requestId !== requestIdRef.current) {
        return;
      }

      if (!product) {
        throw new Error('Product details were unavailable.');
      }

      setData(product);
      setError(null);
    } catch (fetchError) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setError(
        getApiErrorMessage(fetchError, 'Unable to load this saree right now. Please try again.')
      );
      setData(null);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [productId]);

  useEffect(() => {
    void fetchProduct();
  }, [fetchProduct]);

  useFocusEffect(
    useCallback(() => {
      if (!productId) {
        return undefined;
      }

      if (!hasFocusedOnceRef.current) {
        hasFocusedOnceRef.current = true;
        return undefined;
      }

      void fetchProduct();
      return undefined;
    }, [fetchProduct, productId])
  );

  const refetch = useCallback(async (): Promise<void> => {
    await fetchProduct();
  }, [fetchProduct]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

export default useProduct;

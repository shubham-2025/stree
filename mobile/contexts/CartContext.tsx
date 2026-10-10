import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';

import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../lib/storage';
import type { CartItem, Product } from '../lib/types';
import { useToast } from './ToastContext';

interface CartSummary {
  itemCount: number;
  cartTotal: number;
}

interface CartState extends CartSummary {
  items: CartItem[];
  hydrated: boolean;
}

type CartAction =
  | { type: 'hydrate'; payload: CartItem[] }
  | { type: 'add'; payload: { product: Product; quantity: number } }
  | { type: 'remove'; payload: { id: string } }
  | { type: 'update'; payload: { id: string; quantity: number } }
  | { type: 'clear' };

export interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  itemCount: number;
  cartTotal: number;
  hydrated: boolean;
  add: (product: Product, qty?: number) => void;
  remove: (id: string) => void;
  update: (id: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const INITIAL_STATE: CartState = {
  items: [],
  itemCount: 0,
  cartTotal: 0,
  hydrated: false,
};

function calculateCartSummary(items: CartItem[]): CartSummary {
  return items.reduce(
    (summary, item) => ({
      itemCount: summary.itemCount + item.quantity,
      cartTotal: summary.cartTotal + item.price * item.quantity,
    }),
    {
      itemCount: 0,
      cartTotal: 0,
    }
  );
}

function resolveStockLimit(product: Pick<Product, 'stockQty' | 'inStock'>): number | undefined {
  if (typeof product.stockQty === 'number' && product.stockQty >= 0) {
    return Math.floor(product.stockQty);
  }

  if (product.inStock === false) {
    return 0;
  }

  return undefined;
}

function clampCartQuantity(
  quantity: number,
  stockLimit?: number
): number {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return 0;
  }

  const normalized = Math.floor(quantity);

  if (typeof stockLimit !== 'number') {
    return normalized;
  }

  return Math.max(0, Math.min(normalized, stockLimit));
}

function createCartItem(product: Product, quantity: number): CartItem {
  return {
    ...product,
    images: Array.isArray(product.images) ? product.images : product.image ? [product.image] : [],
    quantity,
  };
}

function sanitizeCartItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is CartItem => {
      return (
        typeof item === 'object' &&
        item !== null &&
        typeof (item as CartItem).id === 'string' &&
        typeof (item as CartItem).name === 'string' &&
        typeof (item as CartItem).price === 'number' &&
        typeof (item as CartItem).quantity === 'number'
      );
    })
    .map((item) => ({
      ...item,
      images: Array.isArray(item.images)
        ? item.images.filter((image): image is string => typeof image === 'string')
        : item.image
          ? [item.image]
          : [],
      quantity: item.quantity > 0 ? item.quantity : 1,
    }));
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'hydrate': {
      const items = sanitizeCartItems(action.payload);
      return {
        ...calculateCartSummary(items),
        items,
        hydrated: true,
      };
    }
    case 'add': {
      const stockLimit = resolveStockLimit(action.payload.product);
      const existingIndex = state.items.findIndex((item) => item.id === action.payload.product.id);
      const existingQuantity =
        existingIndex >= 0 ? state.items[existingIndex]?.quantity ?? 0 : 0;
      const requestedQuantity =
        Number.isFinite(action.payload.quantity) && action.payload.quantity > 0
          ? Math.floor(action.payload.quantity)
          : 1;
      const nextQuantity = clampCartQuantity(
        existingQuantity + requestedQuantity,
        stockLimit
      );

      if (nextQuantity <= 0) {
        return state;
      }

      const items =
        existingIndex >= 0
          ? state.items.map((item, index) =>
              index === existingIndex
                ? {
                    ...item,
                    ...action.payload.product,
                    images: Array.isArray(action.payload.product.images)
                      ? action.payload.product.images
                      : action.payload.product.image
                        ? [action.payload.product.image]
                        : item.images,
                    quantity: nextQuantity,
                  }
                : item
            )
          : [...state.items, createCartItem(action.payload.product, nextQuantity)];

      return {
        ...state,
        ...calculateCartSummary(items),
        items,
      };
    }
    case 'remove': {
      const items = state.items.filter((item) => item.id !== action.payload.id);
      return {
        ...state,
        ...calculateCartSummary(items),
        items,
      };
    }
    case 'update': {
      const targetItem = state.items.find((item) => item.id === action.payload.id);
      const stockLimit = targetItem ? resolveStockLimit(targetItem) : undefined;
      const requestedQuantity = Number.isFinite(action.payload.quantity)
        ? Math.floor(action.payload.quantity)
        : 0;
      const nextQuantity = clampCartQuantity(requestedQuantity, stockLimit);

      if (nextQuantity <= 0) {
        const items = state.items.filter((item) => item.id !== action.payload.id);
        return {
          ...state,
          ...calculateCartSummary(items),
          items,
        };
      }

      const items = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: nextQuantity }
          : item
      );
      return {
        ...state,
        ...calculateCartSummary(items),
        items,
      };
    }
    case 'clear':
      return {
        ...state,
        items: [],
        itemCount: 0,
        cartTotal: 0,
      };
    default:
      return state;
  }
}

export interface CartProviderProps {
  children: ReactNode;
}

/**
 * Provides persisted cart state and actions to the Stree mobile app.
 */
export function CartProvider({ children }: CartProviderProps): React.JSX.Element {
  const { showToast } = useToast();
  const [state, dispatch] = useReducer(cartReducer, INITIAL_STATE);

  useEffect(() => {
    let isMounted = true;

    const hydrateCart = async (): Promise<void> => {
      try {
        const storedCart = await getStorageItem<CartItem[]>(STORAGE_KEYS.cart);

        if (isMounted) {
          dispatch({ type: 'hydrate', payload: storedCart ?? [] });
        }
      } catch {
        if (isMounted) {
          dispatch({ type: 'hydrate', payload: [] });
        }
      }
    };

    void hydrateCart();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!state.hydrated) {
      return;
    }

    void setStorageItem(STORAGE_KEYS.cart, state.items).catch(() => undefined);
  }, [state.hydrated, state.items]);

  const add = useCallback((product: Product, qty = 1): void => {
    const stockLimit = resolveStockLimit(product);
    const existingQuantity =
      state.items.find((item) => item.id === product.id)?.quantity ?? 0;
    const requestedQuantity =
      Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : 1;
    const nextQuantity = clampCartQuantity(
      existingQuantity + requestedQuantity,
      stockLimit
    );

    if (nextQuantity <= 0 || nextQuantity === existingQuantity) {
      showToast({
        title: product.inStock === false ? 'Out of stock' : 'Stock limit reached',
        message:
          product.inStock === false
            ? `${product.name} is currently unavailable.`
            : `Only ${stockLimit ?? 0} piece(s) of ${product.name} can be added.`,
        iconName: 'alert-circle-outline',
        tone: 'primary',
      });
      return;
    }

    dispatch({
      type: 'add',
      payload: {
        product,
        quantity: qty,
      },
    });
    showToast({
      title: 'Added to cart',
      message: `${product.name} · ${nextQuantity} in bag`,
      iconName: 'bag-check-outline',
      tone: 'success',
      durationMs: 3200,
    });
  }, [showToast, state.items]);

  const remove = useCallback((id: string): void => {
    const removedItem = state.items.find((item) => item.id === id);

    dispatch({
      type: 'remove',
      payload: { id },
    });
    showToast({
      title: removedItem ? `${removedItem.name} removed` : 'Item removed',
      message: 'Your bag has been updated.',
      iconName: 'trash-outline',
      tone: 'primary',
    });
  }, [showToast, state.items]);

  const update = useCallback((id: string, qty: number): void => {
    dispatch({
      type: 'update',
      payload: {
        id,
        quantity: qty,
      },
    });
  }, []);

  const clear = useCallback((): void => {
    if (state.items.length === 0) {
      return;
    }

    dispatch({ type: 'clear' });
    showToast({
      title: 'Cart cleared',
      message: 'You can start a fresh shortlist whenever you are ready.',
      iconName: 'sparkles-outline',
      tone: 'accent',
    });
  }, [showToast, state.items.length]);

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      count: state.itemCount,
      total: state.cartTotal,
      itemCount: state.itemCount,
      cartTotal: state.cartTotal,
      hydrated: state.hydrated,
      add,
      remove,
      update,
      clear,
    }),
    [add, clear, remove, state.cartTotal, state.hydrated, state.itemCount, state.items, update]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Returns the active cart context.
 */
export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider.');
  }

  return context;
}

export default CartProvider;

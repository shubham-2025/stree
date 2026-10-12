"use client";

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { CartItem } from "@/lib/types";

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, color: string) => void;
  updateQty: (productId: string, color: string, qty: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "stree_cart";
const EMPTY_CART: CartItem[] = [];
const cartListeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedCart: CartItem[] = EMPTY_CART;

function readCartSnapshot(): CartItem[] {
  if (typeof window === "undefined") return EMPTY_CART;

  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) {
      cachedRaw = null;
      cachedCart = EMPTY_CART;
      return EMPTY_CART;
    }

    // useSyncExternalStore requires a stable reference when data is unchanged.
    if (raw === cachedRaw) {
      return cachedCart;
    }

    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      cachedRaw = raw;
      cachedCart = EMPTY_CART;
      return EMPTY_CART;
    }

    cachedRaw = raw;
    cachedCart = parsed;
    return cachedCart;
  } catch {
    cachedRaw = null;
    cachedCart = EMPTY_CART;
    return EMPTY_CART;
  }
}

function getServerCartSnapshot(): CartItem[] {
  return EMPTY_CART;
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(items);
  localStorage.setItem(CART_KEY, raw);
  cachedRaw = raw;
  cachedCart = items.length > 0 ? items : EMPTY_CART;
  cartListeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  cartListeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === CART_KEY || event.key === null) {
      cachedRaw = null;
      listener();
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    cartListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    subscribe,
    readCartSnapshot,
    getServerCartSnapshot
  );

  const addToCart = useCallback((item: CartItem) => {
    const currentItems = readCartSnapshot();
    const idx = currentItems.findIndex(
      (i) => i.productId === item.productId && i.color === item.color
    );

    if (idx >= 0) {
      const updated = [...currentItems];
      updated[idx] = { ...updated[idx], qty: updated[idx].qty + item.qty };
      saveCart(updated);
      return;
    }

    saveCart([...currentItems, item]);
  }, []);

  const removeFromCart = useCallback((productId: string, color: string) => {
    saveCart(
      readCartSnapshot().filter(
        (item) => !(item.productId === productId && item.color === color)
      )
    );
  }, []);

  const updateQty = useCallback(
    (productId: string, color: string, qty: number) => {
      if (qty < 1) return;
      saveCart(
        readCartSnapshot().map((item) =>
          item.productId === productId && item.color === color
            ? { ...item, qty }
            : item
        )
      );
    },
    []
  );

  const clearCart = useCallback(() => saveCart([]), []);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQty, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

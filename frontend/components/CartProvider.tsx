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
const cartListeners = new Set<() => void>();

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  cartListeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  cartListeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === CART_KEY) {
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
  const items = useSyncExternalStore(subscribe, loadCart, () => []);

  const addToCart = useCallback((item: CartItem) => {
    const currentItems = loadCart();
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
      loadCart().filter(
        (item) => !(item.productId === productId && item.color === color)
      )
    );
  }, []);

  const updateQty = useCallback(
    (productId: string, color: string, qty: number) => {
      if (qty < 1) return;
      saveCart(
        loadCart().map((item) =>
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


"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
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
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setItems(loadCart());
    setLoaded(true);
  }, []);

  // Persist changes
  useEffect(() => {
    if (loaded) saveCart(items);
  }, [items, loaded]);

  const addToCart = useCallback((item: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.productId === item.productId && i.color === item.color
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], qty: updated[idx].qty + item.qty };
        return updated;
      }
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((productId: string, color: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.color === color))
    );
  }, []);

  const updateQty = useCallback(
    (productId: string, color: string, qty: number) => {
      if (qty < 1) return;
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId && i.color === color ? { ...i, qty } : i
        )
      );
    },
    []
  );

  const clearCart = useCallback(() => setItems([]), []);

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


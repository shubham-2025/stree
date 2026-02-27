"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface FavouritesContextType {
  favourites: string[]; // array of product IDs
  toggleFavourite: (productId: string) => void;
  isFavourite: (productId: string) => boolean;
  count: number;
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(
  undefined
);

const FAV_KEY = "stree_favourites";

function loadFavs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAV_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavs(ids: string[]) {
  localStorage.setItem(FAV_KEY, JSON.stringify(ids));
}

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const [favourites, setFavourites] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFavourites(loadFavs());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveFavs(favourites);
  }, [favourites, loaded]);

  const toggleFavourite = useCallback((productId: string) => {
    setFavourites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const isFavourite = useCallback(
    (productId: string) => favourites.includes(productId),
    [favourites]
  );

  return (
    <FavouritesContext.Provider
      value={{ favourites, toggleFavourite, isFavourite, count: favourites.length }}
    >
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const ctx = useContext(FavouritesContext);
  if (!ctx)
    throw new Error("useFavourites must be used within FavouritesProvider");
  return ctx;
}


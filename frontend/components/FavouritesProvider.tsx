"use client";

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
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
const EMPTY_FAVS: string[] = [];
const favouritesListeners = new Set<() => void>();

function loadFavs(): string[] {
  if (typeof window === "undefined") return EMPTY_FAVS;
  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (!raw) return EMPTY_FAVS;
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : EMPTY_FAVS;
  } catch {
    return EMPTY_FAVS;
  }
}

function getServerFavsSnapshot(): string[] {
  return EMPTY_FAVS;
}

function saveFavs(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FAV_KEY, JSON.stringify(ids));
  favouritesListeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  favouritesListeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === FAV_KEY) {
      listener();
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    favouritesListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const favourites = useSyncExternalStore(
    subscribe,
    loadFavs,
    getServerFavsSnapshot
  );

  const toggleFavourite = useCallback((productId: string) => {
    const currentFavourites = loadFavs();
    saveFavs(
      currentFavourites.includes(productId)
        ? currentFavourites.filter((id) => id !== productId)
        : [...currentFavourites, productId]
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


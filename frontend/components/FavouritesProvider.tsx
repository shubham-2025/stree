"use client";

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react";

interface FavouritesContextType {
  favourites: string[];
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

let cachedRaw: string | null = null;
let cachedFavs: string[] = EMPTY_FAVS;

function readFavsSnapshot(): string[] {
  if (typeof window === "undefined") return EMPTY_FAVS;

  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (!raw) {
      cachedRaw = null;
      cachedFavs = EMPTY_FAVS;
      return EMPTY_FAVS;
    }

    if (raw === cachedRaw) {
      return cachedFavs;
    }

    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      cachedRaw = raw;
      cachedFavs = EMPTY_FAVS;
      return EMPTY_FAVS;
    }

    cachedRaw = raw;
    cachedFavs = parsed;
    return cachedFavs;
  } catch {
    cachedRaw = null;
    cachedFavs = EMPTY_FAVS;
    return EMPTY_FAVS;
  }
}

function getServerFavsSnapshot(): string[] {
  return EMPTY_FAVS;
}

function saveFavs(ids: string[]) {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(ids);
  localStorage.setItem(FAV_KEY, raw);
  cachedRaw = raw;
  cachedFavs = ids.length > 0 ? ids : EMPTY_FAVS;
  favouritesListeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  favouritesListeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === FAV_KEY || event.key === null) {
      cachedRaw = null;
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
    readFavsSnapshot,
    getServerFavsSnapshot
  );

  const toggleFavourite = useCallback((productId: string) => {
    const currentFavourites = readFavsSnapshot();
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
      value={{
        favourites,
        toggleFavourite,
        isFavourite,
        count: favourites.length,
      }}
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

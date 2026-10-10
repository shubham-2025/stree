import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Appearance } from 'react-native';

import { DEFAULT_PREFERENCES, normalizePreferences, type ThemeMode } from '../lib/preferences';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../lib/storage';

function applyNativeColorScheme(mode: ThemeMode): void {
  // Web / SSR builds may not implement Appearance.setColorScheme.
  if (typeof Appearance.setColorScheme === 'function') {
    Appearance.setColorScheme(mode);
  }
}

// Keep the mobile app light by default until the user explicitly switches modes.
applyNativeColorScheme(DEFAULT_PREFERENCES.themeMode);

export interface ThemePreferenceContextValue {
  themeMode: ThemeMode;
  hydrated: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | null>(null);

export interface ThemePreferenceProviderProps {
  children: ReactNode;
}

/**
 * Persists the user's light or dark mode choice and applies it across the app.
 */
export function ThemePreferenceProvider({
  children,
}: ThemePreferenceProviderProps): React.JSX.Element {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(
    DEFAULT_PREFERENCES.themeMode
  );
  const [hydrated, setHydrated] = useState<boolean>(false);

  const applyThemeMode = useCallback((mode: ThemeMode): void => {
    applyNativeColorScheme(mode);
    setThemeModeState(mode);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadThemePreference = async (): Promise<void> => {
      try {
        const storedPreferences = await getStorageItem<unknown>(STORAGE_KEYS.preferences);
        const normalizedPreferences = normalizePreferences(storedPreferences);

        if (isMounted) {
          applyThemeMode(normalizedPreferences.themeMode);
        }
      } finally {
        if (isMounted) {
          setHydrated(true);
        }
      }
    };

    void loadThemePreference();

    return () => {
      isMounted = false;
    };
  }, [applyThemeMode]);

  const setThemeMode = useCallback(
    async (mode: ThemeMode): Promise<void> => {
      applyThemeMode(mode);

      const storedPreferences = normalizePreferences(
        await getStorageItem<unknown>(STORAGE_KEYS.preferences).catch(() => null)
      );

      await setStorageItem(STORAGE_KEYS.preferences, {
        ...storedPreferences,
        themeMode: mode,
      }).catch(() => undefined);
    },
    [applyThemeMode]
  );

  const value = useMemo<ThemePreferenceContextValue>(
    () => ({
      themeMode,
      hydrated,
      setThemeMode,
    }),
    [hydrated, setThemeMode, themeMode]
  );

  return (
    <ThemePreferenceContext.Provider value={value}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

/**
 * Returns the persisted app theme preference state.
 */
export function useThemePreference(): ThemePreferenceContextValue {
  const context = useContext(ThemePreferenceContext);

  if (!context) {
    throw new Error('useThemePreference must be used within a ThemePreferenceProvider.');
  }

  return context;
}

export default ThemePreferenceProvider;

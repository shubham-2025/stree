import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  cart: 'stree_cart',
  wishlist: 'stree_wishlist',
  authToken: 'stree_auth_token',
  authRefreshToken: 'stree_auth_refresh_token',
  authUser: 'stree_auth_user',
  authIntroSeen: 'stree_auth_intro_seen',
  orderHistory: 'stree_orders',
  preferences: 'stree_preferences',
  guestCheckoutProfile: 'stree_guest_checkout_profile',
} as const;

export class StorageError extends Error {
  public readonly key: string;

  constructor(message: string, key: string) {
    super(message);
    this.name = 'StorageError';
    this.key = key;
  }
}

/**
 * Persists a serializable value to AsyncStorage.
 */
export async function setStorageItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to save local data.';
    throw new StorageError(message, key);
  }
}

/**
 * Reads and parses a value from AsyncStorage.
 */
export async function getStorageItem<T>(key: string): Promise<T | null> {
  try {
    const storedValue = await AsyncStorage.getItem(key);

    if (storedValue === null) {
      return null;
    }

    return JSON.parse(storedValue) as T;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to read local data.';
    throw new StorageError(message, key);
  }
}

/**
 * Removes a single AsyncStorage entry.
 */
export async function removeStorageItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to remove local data.';
    throw new StorageError(message, key);
  }
}

/**
 * Removes multiple AsyncStorage entries in one operation.
 */
export async function removeStorageItems(keys: string[]): Promise<void> {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to clear local data.';
    throw new StorageError(message, keys.join(','));
  }
}

/**
 * Returns whether a storage entry exists for the given key.
 */
export async function hasStorageItem(key: string): Promise<boolean> {
  const value = await getStorageItem<unknown>(key);
  return value !== null;
}

/**
 * Clears the app-owned persisted keys without touching unrelated storage.
 */
export async function clearAppStorage(): Promise<void> {
  await removeStorageItems(Object.values(STORAGE_KEYS));
}

import { DeviceEventEmitter } from 'react-native';

import { setStorageItem, STORAGE_KEYS } from './storage';

export const AUTH_INTRO_SEEN_EVENT = 'stree:auth-intro-seen';

/**
 * Persists the welcome/auth intro as completed and notifies the app shell
 * so guest continue / signup are not bounced back to the welcome screen.
 */
export async function markAuthIntroSeen(): Promise<void> {
  await setStorageItem(STORAGE_KEYS.authIntroSeen, true).catch(() => undefined);
  DeviceEventEmitter.emit(AUTH_INTRO_SEEN_EVENT, true);
}

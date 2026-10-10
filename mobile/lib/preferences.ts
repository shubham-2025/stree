export type ThemeMode = 'light' | 'dark';

export interface AppPreferences {
  notificationsEnabled: boolean;
  themeMode: ThemeMode;
}

export const DEFAULT_PREFERENCES: AppPreferences = {
  notificationsEnabled: true,
  themeMode: 'light',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Normalizes persisted preferences so older installs fall back safely.
 */
export function normalizePreferences(value: unknown): AppPreferences {
  if (!isRecord(value)) {
    return DEFAULT_PREFERENCES;
  }

  return {
    notificationsEnabled:
      typeof value.notificationsEnabled === 'boolean'
        ? value.notificationsEnabled
        : DEFAULT_PREFERENCES.notificationsEnabled,
    themeMode: value.themeMode === 'dark' ? 'dark' : DEFAULT_PREFERENCES.themeMode,
  };
}
